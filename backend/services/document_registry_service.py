from pathlib import Path


class DocumentRegistryService:

    @staticmethod
    def list_documents():

        data_dir = Path("data/raw")

        documents = []

        for file in data_dir.rglob("*"):

            if file.is_file():

                documents.append(
                    {
                        "filename": file.name,
                        "path": str(file)
                    }
                )

        return documents