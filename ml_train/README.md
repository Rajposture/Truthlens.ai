# ML Training Pipeline

Trains the claim-veracity classifier used by `backend/ml_classifier.py`, on the
LIAR dataset (Wang, 2017 - ACL). See `/TruthLens_ML_Training_Report.docx` at the
project root for the full write-up: methodology, metrics, confusion matrices,
and the neural-network training curves.

## Reproduce it

```bash
cd ml_train
pip install pandas numpy scikit-learn matplotlib joblib

mkdir -p data
curl -o data/train.tsv https://raw.githubusercontent.com/tfs4/liar_dataset/master/train.tsv
curl -o data/test.tsv  https://raw.githubusercontent.com/tfs4/liar_dataset/master/test.tsv
curl -o data/valid.tsv https://raw.githubusercontent.com/tfs4/liar_dataset/master/valid.tsv

python3 train.py
```

Outputs: `artifacts/` (plots + full metrics JSON), `models/` (the trained
TF-IDF vectorizer + classifier, already copied into `backend/ml_models/` for
the live app).

Trains 4 models (Naive Bayes, Logistic Regression, Linear SVM, and a 2-hidden-
layer MLP neural network) on both the original 6-way LIAR labels and
TruthLens's own True/False/Misleading scheme, and picks the best 3-way model
by macro-F1 for deployment.
