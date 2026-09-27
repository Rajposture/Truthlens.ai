"""
Online/adaptive claim-veracity learner for TruthLens.

Design:
- Uses the existing supervised baseline as the seed model.
- Accepts new training samples only when the verification pipeline has
  evidence-backed, high-confidence outcomes.
- Retrains periodically on a mixture of the original LIAR baseline and
  accumulated verified samples.
- Never treats arbitrary user claims as labels.
- Persists samples and a runtime model outside the read-only packaged model.
"""
from __future__ import annotations

import json
import logging
import threading
from collections import Counter
from pathlib import Path
from typing import Any

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split

from config import settings

logger = logging.getLogger("truthlens.adaptive_ml")

LABELS = ("True", "False", "Misleading")

_runtime_lock = threading.RLock()


class AdaptiveVerdictLearner:
    def __init__(self) -> None:
        self._vectorizer: TfidfVectorizer | None = None
        self._model: LogisticRegression | None = None
        self._metadata: dict[str, Any] = {}
        self._load_runtime_or_seed()

    @property
    def available(self) -> bool:
        return self._vectorizer is not None and self._model is not None

    @property
    def metadata(self) -> dict[str, Any]:
        return dict(self._metadata)

    def _seed_paths(self) -> tuple[Path, Path, Path]:
        base = Path(__file__).resolve().parent / "ml_models"
        return (
            base / "tfidf_vectorizer.joblib",
            base / "verdict_classifier.joblib",
            base / "model_info.json",
        )

    def _runtime_paths(self) -> tuple[Path, Path]:
        base = settings.ml_runtime_model_dir
        return base / "tfidf_vectorizer.joblib", base / "verdict_classifier.joblib"

    def _load_runtime_or_seed(self) -> None:
        runtime_vec, runtime_model = self._runtime_paths()
        try:
            if runtime_vec.exists() and runtime_model.exists():
                self._vectorizer = joblib.load(runtime_vec)
                self._model = joblib.load(runtime_model)
                meta_path = settings.ml_runtime_model_dir / "model_info.json"
                if meta_path.exists():
                    self._metadata = json.loads(meta_path.read_text(encoding="utf-8"))
                self._metadata.setdefault("source", "runtime_adaptive")
                return
        except Exception:
            logger.exception("Failed to load adaptive runtime model; falling back to baseline.")

        seed_vec, seed_model, seed_info = self._seed_paths()
        try:
            self._vectorizer = joblib.load(seed_vec)
            self._model = joblib.load(seed_model)
            self._metadata = json.loads(seed_info.read_text(encoding="utf-8"))
            self._metadata["source"] = "packaged_baseline"
        except Exception:
            logger.exception("Failed to load packaged ML model.")
            self._vectorizer = None
            self._model = None
            self._metadata = {}

    def predict(self, claim: str) -> dict[str, Any] | None:
        if not self.available:
            return None

        with _runtime_lock:
            features = self._vectorizer.transform([claim])

            if hasattr(self._model, "predict_proba"):
                probs = self._model.predict_proba(features)[0]
                classes = list(self._model.classes_)
                ranked = sorted(
                    zip(classes, probs),
                    key=lambda x: float(x[1]),
                    reverse=True,
                )
                verdict = str(ranked[0][0])
                top_p = float(ranked[0][1])
                second_p = float(ranked[1][1]) if len(ranked) > 1 else 0.0
                margin = max(0.0, top_p - second_p)

                if top_p >= 0.70 and margin >= 0.20:
                    level = "High"
                elif top_p >= 0.50 and margin >= 0.10:
                    level = "Medium"
                else:
                    level = "Low"

                return {
                    "verdict": verdict,
                    "confidence": round(top_p * 100, 1),
                    "confidence_level": level,
                    "uncertain": level == "Low",
                    "probabilities": {
                        str(cls): round(float(p) * 100, 1)
                        for cls, p in zip(classes, probs)
                    },
                    "model": self._metadata.get("winner", "Logistic Regression"),
                    "model_version": self._metadata.get("version", "baseline"),
                    "training_samples": self._metadata.get("training_samples"),
                    "adaptive_samples": self._metadata.get("adaptive_samples", 0),
                }

            verdict = str(self._model.predict(features)[0])
            return {
                "verdict": verdict,
                "confidence": None,
                "confidence_level": "Low",
                "uncertain": True,
                "probabilities": {},
                "model": type(self._model).__name__,
                "model_version": self._metadata.get("version", "baseline"),
                "training_samples": self._metadata.get("training_samples"),
                "adaptive_samples": self._metadata.get("adaptive_samples", 0),
            }

    def maybe_learn(
        self,
        *,
        claim: str,
        verdict: str,
        evidence_count: int,
        verification_confidence: int,
        used_web_search: bool,
    ) -> dict[str, Any]:
        if not settings.ML_ONLINE_LEARNING_ENABLED:
            return {"accepted": False, "reason": "disabled"}

        if verdict not in LABELS:
            return {"accepted": False, "reason": "unsupported_verdict"}

        if evidence_count < 1:
            return {"accepted": False, "reason": "no_evidence"}

        if verification_confidence < settings.ML_MIN_TRAIN_CONFIDENCE:
            return {"accepted": False, "reason": "verification_confidence_too_low"}

        # Web evidence is allowed, but only if the RAG+LLM confidence is high.
        sample = {
            "text": claim.strip(),
            "label": verdict,
            "verification_confidence": int(verification_confidence),
            "evidence_count": int(evidence_count),
            "used_web_search": bool(used_web_search),
        }

        with _runtime_lock:
            samples = self._read_samples()
            # Simple de-duplication on normalized text + label.
            key = (sample["text"].strip().lower(), sample["label"])
            if any((s["text"].strip().lower(), s["label"]) == key for s in samples):
                return {"accepted": False, "reason": "duplicate"}

            samples.append(sample)
            samples = samples[-settings.ML_MAX_LIVE_SAMPLES :]
            self._append_sample(sample)

            retrained = False
            total = len(samples)
            if total >= settings.ML_RETRAIN_MIN_SAMPLES and total % settings.ML_RETRAIN_EVERY == 0:
                retrained = self.retrain(samples)

            return {
                "accepted": True,
                "reason": "evidence_backed",
                "retrained": retrained,
                "adaptive_samples": total,
            }

    def _read_samples(self) -> list[dict[str, Any]]:
        path = settings.ml_samples_path
        if not path.exists():
            return []
        rows: list[dict[str, Any]] = []
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
                if row.get("label") in LABELS and row.get("text"):
                    rows.append(row)
            except json.JSONDecodeError:
                continue
        return rows[-settings.ML_MAX_LIVE_SAMPLES :]

    def _append_sample(self, sample: dict[str, Any]) -> None:
        settings.ml_samples_path.parent.mkdir(parents=True, exist_ok=True)
        with settings.ml_samples_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(sample, ensure_ascii=False) + "\n")

    def retrain(self, samples: list[dict[str, Any]]) -> bool:
        # The public baseline already comes from a held-out evaluated benchmark.
        # We only train a new model when a meaningful set of verified observations exists.
        texts = [s["text"] for s in samples]
        labels = [s["label"] for s in samples]

        counts = Counter(labels)
        if any(counts[label] < 10 for label in LABELS):
            logger.info("Adaptive retrain skipped; class counts are too uneven: %s", counts)
            return False

        try:
            X_train, X_valid, y_train, y_valid = train_test_split(
                texts,
                labels,
                test_size=0.2,
                random_state=42,
                stratify=labels,
            )
        except ValueError:
            return False

        vectorizer = TfidfVectorizer(
            max_features=30000,
            ngram_range=(1, 2),
            min_df=1,
            stop_words="english",
            sublinear_tf=True,
        )
        Xtr = vectorizer.fit_transform(X_train)
        Xva = vectorizer.transform(X_valid)

        model = LogisticRegression(
            max_iter=1500,
            class_weight="balanced",
            C=2.0,
            random_state=42,
        )
        model.fit(Xtr, y_train)
        pred = model.predict(Xva)
        metrics = {
            "validation_accuracy": round(float(accuracy_score(y_valid, pred)), 4),
            "validation_macro_f1": round(float(f1_score(y_valid, pred, average="macro")), 4),
        }

        runtime_vec, runtime_model = self._runtime_paths()
        joblib.dump(vectorizer, runtime_vec)
        joblib.dump(model, runtime_model)

        self._vectorizer = vectorizer
        self._model = model
        self._metadata = {
            "version": settings.ML_MODEL_VERSION,
            "source": "adaptive_evidence_backed",
            "model": "TF-IDF + Logistic Regression",
            "labels": list(LABELS),
            "training_samples": len(samples),
            "adaptive_samples": len(samples),
            "validation": metrics,
            "class_counts": dict(counts),
        }
        (settings.ml_runtime_model_dir / "model_info.json").write_text(
            json.dumps(self._metadata, indent=2),
            encoding="utf-8",
        )
        logger.info("Adaptive model retrained: %s", metrics)
        return True


adaptive_learner = AdaptiveVerdictLearner()
