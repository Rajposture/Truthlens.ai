from rag.vector_store import get_collection


class StatsService:

    @staticmethod
    def get_stats():

        return {
            "documents": get_collection().count()
        }