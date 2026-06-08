class VerdictParser:

    @staticmethod
    def classify(text: str):

        text = text.lower()

        if "false" in text:
            return "False"

        if "true" in text:
            return "True"

        if "misleading" in text:
            return "Misleading"

        return "Unknown"