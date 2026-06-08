from rag.vector_store import collection


class StatsService:

    @staticmethod
    def get_stats():

        return {
            "documents": collection.count()
        }