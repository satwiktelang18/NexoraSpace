from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from app.core.config import settings
import uuid

client = AsyncQdrantClient(
    host=settings.QDRANT_HOST,
    port=settings.QDRANT_PORT,
)

COLLECTION_NAME = settings.QDRANT_COLLECTION_NAME
VECTOR_SIZE = 384


async def ensure_collection():
    collections = await client.get_collections()
    names = [c.name for c in collections.collections]
    if COLLECTION_NAME not in names:
        await client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )


async def store_embeddings(chunks: list[dict], embeddings: list[list[float]], document_id: str):
    await ensure_collection()
    points = []
    for chunk, embedding in zip(chunks, embeddings):
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "document_id": document_id,
                    "chunk_text": chunk["chunk_text"],
                    "page_number": chunk["page_number"],
                    "chunk_index": chunk["chunk_index"],
                },
            )
        )
    await client.upsert(collection_name=COLLECTION_NAME, points=points)
    return [p.id for p in points]


async def search_similar(query_embedding: list[float], document_ids: list[str], top_k: int = 20):
    await ensure_collection()

    collection_info = await client.get_collection(COLLECTION_NAME)
    total_points = collection_info.points_count

    actual_top_k = min(top_k, total_points) if total_points else top_k

    if not actual_top_k:
        return []

    if document_ids:
        results = await client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=actual_top_k,
            query_filter=Filter(
                should=[
                    FieldCondition(
                        key="document_id",
                        match=MatchValue(value=doc_id),
                    )
                    for doc_id in document_ids
                ]
            ),
        )
    else:
        results = await client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=actual_top_k,
        )
    return results


async def delete_document_vectors(document_id: str):
    from qdrant_client.models import FilterSelector
    await client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=FilterSelector(
            filter=Filter(
                must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
            )
        ),
    )

def store_embeddings_sync(chunks: list, embeddings: list, document_id: str):
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct
    import uuid as uuid_lib

    client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)

    collections = client.get_collections()
    names = [c.name for c in collections.collections]
    if COLLECTION_NAME not in names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

    points = []
    for chunk, embedding in zip(chunks, embeddings):
        points.append(
            PointStruct(
                id=str(uuid_lib.uuid4()),
                vector=embedding,
                payload={
                    "document_id": document_id,
                    "chunk_text": chunk["chunk_text"],
                    "page_number": chunk["page_number"],
                    "chunk_index": chunk["chunk_index"],
                },
            )
        )
    client.upsert(collection_name=COLLECTION_NAME, points=points)