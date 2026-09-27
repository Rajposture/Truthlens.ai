"""
Trains and compares four models on the LIAR dataset:
  1. Multinomial Naive Bayes   (classical, probabilistic baseline)
  2. Logistic Regression        (classical, linear)
  3. Linear SVM                 (classical, margin-based)
  4. MLP (neural network)       (2 hidden layers, trained via backprop)

All four are trained and evaluated on the ORIGINAL 6-way task (pants-fire /
false / barely-true / half-true / mostly-true / true) so results are directly
comparable to the published LIAR benchmark. The best-performing model is then
retrained on TruthLens's own 3-way verdict scheme (True / False / Misleading)
and saved for integration into the live app.

Run: python3 train.py
Outputs land in artifacts/ (plots) and models/ (pickled model + vectorizer).
"""
import json
import time
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    confusion_matrix, ConfusionMatrixDisplay,
)
from sklearn.naive_bayes import MultinomialNB
from sklearn.neural_network import MLPClassifier
from sklearn.svm import LinearSVC

from data_prep import load_liar, LABEL_ORDER

ARTIFACTS = Path("artifacts")
MODELS = Path("models")
ARTIFACTS.mkdir(exist_ok=True)
MODELS.mkdir(exist_ok=True)

RESULTS: dict = {"six_way": {}, "three_way": {}}


def evaluate(name: str, y_true, y_pred, labels, split: str, task: str) -> dict:
    acc = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, labels=labels, average="macro", zero_division=0
    )
    print(f"  [{task}/{split}] {name:22s} acc={acc:.3f}  macro-P={precision:.3f}  "
          f"macro-R={recall:.3f}  macro-F1={f1:.3f}")
    return {"accuracy": acc, "macro_precision": precision, "macro_recall": recall, "macro_f1": f1}


def plot_confusion(name: str, y_true, y_pred, labels: list[str], out_path: Path, title: str):
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    fig, ax = plt.subplots(figsize=(6, 5.5))
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
    disp.plot(ax=ax, cmap="YlOrBr", colorbar=False, xticks_rotation=35)
    ax.set_title(title, fontsize=11)
    fig.tight_layout()
    fig.savefig(out_path, dpi=140)
    plt.close(fig)


# ---------------------------------------------------------------------------
print("Loading LIAR dataset...")
splits = load_liar("data")
train, valid, test = splits["train"], splits["valid"], splits["test"]
print(f"train={len(train)}  valid={len(valid)}  test={len(test)}")

# ===========================================================================
# PART A - six-way classification (matches the published LIAR benchmark)
# ===========================================================================
print("\n" + "=" * 70)
print("PART A: six-way classification (pants-fire...true) - academic benchmark")
print("=" * 70)

vectorizer_6 = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), min_df=2, stop_words="english")
Xtr6 = vectorizer_6.fit_transform(train["statement"])
Xva6 = vectorizer_6.transform(valid["statement"])
Xte6 = vectorizer_6.transform(test["statement"])
ytr6, yva6, yte6 = train["label"], valid["label"], test["label"]

classical_models_6 = {
    "Naive Bayes": MultinomialNB(),
    "Logistic Regression": LogisticRegression(max_iter=1000, C=2.0, class_weight="balanced"),
    "Linear SVM": LinearSVC(C=0.5, class_weight="balanced", max_iter=5000),
}

for name, model in classical_models_6.items():
    t0 = time.time()
    model.fit(Xtr6, ytr6)
    train_secs = time.time() - t0
    pred_test = model.predict(Xte6)
    RESULTS["six_way"][name] = evaluate(name, yte6, pred_test, LABEL_ORDER, "test", "6-way")
    RESULTS["six_way"][name]["train_seconds"] = round(train_secs, 2)
    plot_confusion(name, yte6, pred_test, LABEL_ORDER, ARTIFACTS / f"cm_6way_{name.replace(' ', '_')}.png",
                   f"{name} - 6-way confusion matrix (test set)")

# --- Neural network (MLP) on the 6-way task, with real per-epoch loss/val curves ---
print("\nTraining MLP neural network (6-way)...")
all_labels_6 = np.array(LABEL_ORDER)
mlp_6 = MLPClassifier(
    hidden_layer_sizes=(256, 64), activation="relu", solver="adam",
    alpha=1e-4, learning_rate_init=1e-3, max_iter=1, warm_start=True, random_state=42,
)

EPOCHS = 40
train_loss_hist, val_acc_hist, train_acc_hist = [], [], []
t0 = time.time()
for epoch in range(EPOCHS):
    mlp_6.partial_fit(Xtr6, ytr6, classes=all_labels_6)
    train_loss_hist.append(mlp_6.loss_)
    train_acc_hist.append(mlp_6.score(Xtr6, ytr6))
    val_acc_hist.append(mlp_6.score(Xva6, yva6))
    if epoch % 5 == 0 or epoch == EPOCHS - 1:
        print(f"  epoch {epoch+1:2d}/{EPOCHS}  train_loss={train_loss_hist[-1]:.4f}  "
              f"train_acc={train_acc_hist[-1]:.3f}  val_acc={val_acc_hist[-1]:.3f}")
train_secs = time.time() - t0

pred_test_mlp = mlp_6.predict(Xte6)
RESULTS["six_way"]["Neural Net (MLP)"] = evaluate(
    "Neural Net (MLP)", yte6, pred_test_mlp, LABEL_ORDER, "test", "6-way"
)
RESULTS["six_way"]["Neural Net (MLP)"]["train_seconds"] = round(train_secs, 2)
plot_confusion("Neural Net (MLP)", yte6, pred_test_mlp, LABEL_ORDER,
               ARTIFACTS / "cm_6way_Neural_Net.png", "Neural Net (MLP) - 6-way confusion matrix (test set)")

# Loss / accuracy curves
fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))
axes[0].plot(range(1, EPOCHS + 1), train_loss_hist, color="#9C7A2E", linewidth=2)
axes[0].set_title("Training loss per epoch")
axes[0].set_xlabel("Epoch")
axes[0].set_ylabel("Loss (log-loss)")
axes[0].grid(alpha=0.3)

axes[1].plot(range(1, EPOCHS + 1), train_acc_hist, label="Train accuracy", color="#3FA796", linewidth=2)
axes[1].plot(range(1, EPOCHS + 1), val_acc_hist, label="Validation accuracy", color="#C1443A", linewidth=2)
axes[1].set_title("Train vs. validation accuracy per epoch")
axes[1].set_xlabel("Epoch")
axes[1].set_ylabel("Accuracy")
axes[1].legend()
axes[1].grid(alpha=0.3)

fig.suptitle("Neural network (MLP) training curves - 6-way LIAR classification", fontsize=12)
fig.tight_layout()
fig.savefig(ARTIFACTS / "training_curves_mlp_6way.png", dpi=140)
plt.close(fig)

# ===========================================================================
# PART B - three-way classification (TruthLens's own verdict scheme)
# ===========================================================================
print("\n" + "=" * 70)
print("PART B: three-way classification (True/False/Misleading) - for app integration")
print("=" * 70)

TL_LABELS = ["True", "False", "Misleading"]
vectorizer_3 = TfidfVectorizer(max_features=20000, ngram_range=(1, 2), min_df=2, stop_words="english")
Xtr3 = vectorizer_3.fit_transform(train["statement"])
Xva3 = vectorizer_3.transform(valid["statement"])
Xte3 = vectorizer_3.transform(test["statement"])
ytr3, yva3, yte3 = train["truthlens_verdict"], valid["truthlens_verdict"], test["truthlens_verdict"]

candidates_3 = {
    "Naive Bayes": MultinomialNB(),
    "Logistic Regression": LogisticRegression(max_iter=1000, C=2.0, class_weight="balanced"),
    "Linear SVM": LinearSVC(C=0.5, class_weight="balanced", max_iter=5000),
}

fitted_3 = {}
for name, model in candidates_3.items():
    model.fit(Xtr3, ytr3)
    fitted_3[name] = model
    pred_test = model.predict(Xte3)
    RESULTS["three_way"][name] = evaluate(name, yte3, pred_test, TL_LABELS, "test", "3-way")
    plot_confusion(name, yte3, pred_test, TL_LABELS, ARTIFACTS / f"cm_3way_{name.replace(' ', '_')}.png",
                   f"{name} - 3-way confusion matrix (test set)")

print("\nTraining MLP neural network (3-way)...")
mlp_3 = MLPClassifier(
    hidden_layer_sizes=(256, 64), activation="relu", solver="adam",
    alpha=1e-4, learning_rate_init=1e-3, max_iter=1, warm_start=True, random_state=42,
)
tl_labels_arr = np.array(TL_LABELS)
train_loss_3, val_acc_3, train_acc_3 = [], [], []
for epoch in range(EPOCHS):
    mlp_3.partial_fit(Xtr3, ytr3, classes=tl_labels_arr)
    train_loss_3.append(mlp_3.loss_)
    train_acc_3.append(mlp_3.score(Xtr3, ytr3))
    val_acc_3.append(mlp_3.score(Xva3, yva3))

pred_test_mlp3 = mlp_3.predict(Xte3)
RESULTS["three_way"]["Neural Net (MLP)"] = evaluate(
    "Neural Net (MLP)", yte3, pred_test_mlp3, TL_LABELS, "test", "3-way"
)
plot_confusion("Neural Net (MLP)", yte3, pred_test_mlp3, TL_LABELS,
               ARTIFACTS / "cm_3way_Neural_Net.png", "Neural Net (MLP) - 3-way confusion matrix (test set)")
fitted_3["Neural Net (MLP)"] = mlp_3

fig, axes = plt.subplots(1, 2, figsize=(11, 4.2))
axes[0].plot(range(1, EPOCHS + 1), train_loss_3, color="#9C7A2E", linewidth=2)
axes[0].set_title("Training loss per epoch")
axes[0].set_xlabel("Epoch"); axes[0].set_ylabel("Loss (log-loss)"); axes[0].grid(alpha=0.3)
axes[1].plot(range(1, EPOCHS + 1), train_acc_3, label="Train accuracy", color="#3FA796", linewidth=2)
axes[1].plot(range(1, EPOCHS + 1), val_acc_3, label="Validation accuracy", color="#C1443A", linewidth=2)
axes[1].set_title("Train vs. validation accuracy per epoch")
axes[1].set_xlabel("Epoch"); axes[1].set_ylabel("Accuracy"); axes[1].legend(); axes[1].grid(alpha=0.3)
fig.suptitle("Neural network (MLP) training curves - 3-way TruthLens verdicts", fontsize=12)
fig.tight_layout()
fig.savefig(ARTIFACTS / "training_curves_mlp_3way.png", dpi=140)
plt.close(fig)

# ===========================================================================
# Model comparison bar chart + pick a winner to deploy
# ===========================================================================
fig, ax = plt.subplots(figsize=(7, 4.5))
names = list(RESULTS["three_way"].keys())
accs = [RESULTS["three_way"][n]["accuracy"] for n in names]
f1s = [RESULTS["three_way"][n]["macro_f1"] for n in names]
x = np.arange(len(names))
ax.bar(x - 0.18, accs, width=0.36, label="Accuracy", color="#9C7A2E")
ax.bar(x + 0.18, f1s, width=0.36, label="Macro F1", color="#3FA796")
ax.set_xticks(x); ax.set_xticklabels(names, rotation=15)
ax.set_ylim(0, 1)
ax.set_title("Model comparison - 3-way TruthLens verdict task (test set)")
ax.legend(); ax.grid(alpha=0.3, axis="y")
fig.tight_layout()
fig.savefig(ARTIFACTS / "model_comparison_3way.png", dpi=140)
plt.close(fig)

winner_name = max(RESULTS["three_way"], key=lambda n: RESULTS["three_way"][n]["macro_f1"])
winner_model = fitted_3[winner_name]
print(f"\nBest model on the 3-way task by macro-F1: {winner_name}")

joblib.dump(vectorizer_3, MODELS / "tfidf_vectorizer.joblib")
joblib.dump(winner_model, MODELS / "verdict_classifier.joblib")
with open(MODELS / "model_info.json", "w") as f:
    json.dump({
        "winner": winner_name,
        "labels": TL_LABELS,
        "metrics": RESULTS["three_way"][winner_name],
    }, f, indent=2)

with open(ARTIFACTS / "all_results.json", "w") as f:
    json.dump(RESULTS, f, indent=2)

print("\nSaved model artifacts to models/, plots to artifacts/.")
print(json.dumps(RESULTS, indent=2))
