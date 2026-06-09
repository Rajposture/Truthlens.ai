import re


class ClaimExtractor:

    @staticmethod
    def extract(text: str):

        if not text:
            return []

        sentences = re.split(
            r"[.!?]+",
            text
        )

        claims = []

        for sentence in sentences:

            sentence = sentence.strip()

            if len(sentence) > 20:

                claims.append(
                    sentence
                )

        return claims