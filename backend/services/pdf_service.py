from pathlib import Path

from pypdf import PdfReader


class PDFService:

    @staticmethod
    def extract_text(
        pdf_path: str
    ) -> str:

        path = Path(pdf_path)

        if not path.exists():

            raise FileNotFoundError(
                f"PDF not found: {pdf_path}"
            )

        try:

            reader = PdfReader(
                str(path)
            )

        except Exception as e:

            raise ValueError(
                f"Failed to open PDF: {e}"
            )

        text_parts = []

        total_pages = len(
            reader.pages
        )

        print(
            f"[PDF] Reading "
            f"{path.name}"
        )

        print(
            f"[PDF] Pages: "
            f"{total_pages}"
        )

        for page_num, page in enumerate(
            reader.pages,
            start=1
        ):

            try:

                page_text = (
                    page.extract_text()
                )

                if (
                    page_text and
                    page_text.strip()
                ):

                    text_parts.append(
                        f"\n[PAGE {page_num}]\n"
                    )

                    text_parts.append(
                        page_text.strip()
                    )

            except Exception as e:

                print(
                    f"[PDF WARNING] "
                    f"Failed page "
                    f"{page_num}: {e}"
                )

                continue

        final_text = "\n".join(
            text_parts
        )

        if not final_text.strip():

            raise ValueError(
                f"No text extracted from "
                f"{path.name}"
            )

        print(
            f"[PDF] Extracted "
            f"{len(final_text)} characters"
        )

        return final_text

    @staticmethod
    def get_pdf_stats(
        pdf_path: str
    ):

        path = Path(pdf_path)

        if not path.exists():

            raise FileNotFoundError(
                f"PDF not found: {pdf_path}"
            )

        reader = PdfReader(
            str(path)
        )

        return {
            "filename": path.name,
            "pages": len(
                reader.pages
            ),
            "encrypted": reader.is_encrypted,
            "size_mb": round(
                path.stat().st_size
                / (1024 * 1024),
                2
            )
        }