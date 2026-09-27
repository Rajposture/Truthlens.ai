"""
Loads and preprocesses the LIAR dataset (Wang, 2017 - "Liar, Liar Pants on Fire":
A New Benchmark Dataset for Fake News Detection, ACL 2017).

12,836 short political statements, each hand-labeled by PolitiFact fact-checkers
on a six-point truthfulness scale. This is the standard academic benchmark for
claim-veracity classification - not a dataset we assembled ourselves.
"""
import pandas as pd

COLUMNS = [
    "id", "label", "statement", "subject", "speaker", "job_title",
    "state", "party", "barely_true_counts", "false_counts",
    "half_true_counts", "mostly_true_counts", "pants_on_fire_counts", "context",
]

# The six original PolitiFact labels, in order from least to most true.
LABEL_ORDER = ["pants-fire", "false", "barely-true", "half-true", "mostly-true", "true"]

# How the 6-way academic labels map onto TruthLens's own 4-way verdict scheme,
# for integration into the live app (LIAR has no "insufficient evidence" concept,
# since every statement here WAS fact-checked, so nothing maps to Unverified).
TO_TRUTHLENS_VERDICT = {
    "true": "True",
    "mostly-true": "True",
    "half-true": "Misleading",
    "barely-true": "Misleading",
    "false": "False",
    "pants-fire": "False",
}


def load_split(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, sep="\t", header=None, names=COLUMNS)
    df = df.dropna(subset=["statement", "label"]).reset_index(drop=True)
    df["label"] = df["label"].str.strip().str.lower()
    df = df[df["label"].isin(LABEL_ORDER)].reset_index(drop=True)
    df["truthlens_verdict"] = df["label"].map(TO_TRUTHLENS_VERDICT)
    return df


def load_liar(data_dir: str = "data") -> dict[str, pd.DataFrame]:
    return {
        "train": load_split(f"{data_dir}/train.tsv"),
        "valid": load_split(f"{data_dir}/valid.tsv"),
        "test": load_split(f"{data_dir}/test.tsv"),
    }


if __name__ == "__main__":
    splits = load_liar()
    for name, df in splits.items():
        print(f"{name}: {len(df)} rows")
    print("\nLabel distribution (train):")
    print(splits["train"]["label"].value_counts().reindex(LABEL_ORDER))
    print("\nTruthLens verdict distribution (train):")
    print(splits["train"]["truthlens_verdict"].value_counts())
    print("\nSample rows:")
    print(splits["train"][["label", "statement", "truthlens_verdict"]].head(3).to_string())
