class ConfidenceAgent:

    @staticmethod
    def score(
        confidence
    ):

        try:

            if isinstance(
                confidence,
                str
            ):

                confidence = (
                    confidence
                    .replace(
                        "%",
                        ""
                    )
                    .strip()
                )

            return float(
                confidence
            )

        except:

            return 50.0