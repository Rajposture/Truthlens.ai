class VerdictParser:

    @staticmethod
    def classify(text: str):

        text = text.lower()

        if "verdict: false" in text:
            return "False"

        if "verdict: true" in text:
            return "True"

        if "verdict: misleading" in text:
            return "Misleading"

        if "verdict: unverified" in text:
            return "Unverified"

        return "Unknown"