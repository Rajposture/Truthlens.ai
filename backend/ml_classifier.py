"""
Loads the classifier trained offline in ml_train/train.py (TF-IDF + Logistic
Regression, trained on the LIAR dataset - see ml_models/model_info.json for
which model won the comparison and its held-out test metrics).

This is a genuinely trained, genuinely evaluated statistical model - not a
call to a pre-trained LLM. It runs alongside the RAG + LLM verdict as a
second, independent signal: two different techniques, shown together.

The model files are tiny (~1MB total for the vectorizer + classifier), so
this adds real ML capability without meaningfully affecting deploy size or
cold-start time.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

import joblib

logger = logging.getLogger("truthlens.ml_classifier")

MODELS_DIR = Path(__file__).resolve().parent / "ml_models"


class VerdictClassifier:
    def __init__(self) -> None:
        self._vectorizer = None
        self._model = None
        self._info: dict = {}
        self._load()

    def _load(self) -> None:
        try:
            self._vectorizer = joblib.load(MODELS_DIR / "tfidf_vectorizer.joblib")
            self._model = joblib.load(MODELS_DIR / "verdict_classifier.joblib")
            with open(MODELS_DIR / "model_info.json") as f:
                self._info = json.load(f)
            logger.info(
                "Loaded trained verdict classifier: %s (test macro-F1=%.3f)",
                self._info.get("winner"),
                self._info.get("metrics", {}).get("macro_f1", 0.0),
            )
        except FileNotFoundError:
            logger.warning(
                "Trained classifier files not found in ml_models/ - "
                "the ML prediction signal will be skipped. Run ml_train/train.py to generate them."
            )

    @property
    def available(self) -> bool:
        return self._model is not None and self._vectorizer is not None

    @property
    def info(self) -> dict:
        return self._info

    def predict(self, claim: str) -> dict | None:
        """Returns {"verdict", "confidence", "probabilities"} or None if unavailable."""
        if not self.available:
            return None

        features = self._vectorizer.transform([claim])

        if hasattr(self._model, "predict_proba"):
            probs = self._model.predict_proba(features)[0]
            classes = self._model.classes_
            best_idx = probs.argmax()
            verdict = classes[best_idx]
            confidence = round(float(probs[best_idx]) * 100, 1)
            probabilities = {cls: round(float(p) * 100, 1) for cls, p in zip(classes, probs)}
        else:
            # LinearSVC etc. have no predict_proba; fall back to decision-function margin.
            verdict = self._model.predict(features)[0]
            scores = self._model.decision_function(features)[0]
            margin = float(scores.max() - scores.mean()) if hasattr(scores, "max") else 0.0
            confidence = round(min(50 + margin * 10, 99.0), 1)
            probabilities = {}

        return {"verdict": str(verdict), "confidence": confidence, "probabilities": probabilities}


verdict_classifier = VerdictClassifier()
