from app.services.rag.extractor import extract_chunks_from_pdf
from app.services.embeddings.embedder import get_embeddings_batch_sync
from app.services.retrieval.vector_store import store_embeddings_sync
from app.services.reranking.reranker import rerank_chunks
from app.services.llm.generator import generate_answer, generate_answer_stream
from app.core.config import settings
import traceback
import psycopg2


def get_sync_db():
    return psycopg2.connect(settings.SYNC_DATABASE_URL)


def ingest_document(document_id: str, file_path: str):
    conn = get_sync_db()
    cur = conn.cursor()

    try:
        cur.execute("UPDATE documents SET status='processing' WHERE id=%s", (document_id,))
        conn.commit()

        print(f"Extracting chunks from {file_path}")
        chunks = extract_chunks_from_pdf(file_path)
        print(f"Extracted {len(chunks)} chunks")

        if not chunks:
            cur.execute("UPDATE documents SET status='failed_no_text' WHERE id=%s", (document_id,))
            conn.commit()
            return

        texts = [c["chunk_text"] for c in chunks]
        print(f"Generating embeddings for {len(texts)} chunks")
        embeddings = get_embeddings_batch_sync(texts)
        print(f"Got {len(embeddings)} embeddings")

        print("Storing in vector DB")
        store_embeddings_sync(chunks, embeddings, document_id)
        print("Stored successfully")

        cur.execute("UPDATE documents SET status='ready' WHERE id=%s", (document_id,))
        conn.commit()
        print(f"Document {document_id} is now READY")

    except Exception as e:
        print(f"ERROR: {e}")
        traceback.print_exc()
        try:
            cur.execute("UPDATE documents SET status='failed' WHERE id=%s", (document_id,))
            conn.commit()
        except:
            pass
    finally:
        cur.close()
        conn.close()


async def query_documents(query: str, document_ids: list[str], stream: bool = False):
    from app.services.embeddings.embedder import get_embedding_sync
    from app.services.retrieval.vector_store import search_similar

    query_embedding = get_embedding_sync(query)
    results = await search_similar(query_embedding, document_ids, top_k=20)

    chunks = [
        {
            "chunk_text": r.payload["chunk_text"],
            "page_number": r.payload.get("page_number"),
            "score": r.score,
        }
        for r in results
    ]

    reranked = rerank_chunks(query, chunks, top_k=4)

    if stream:
        return generate_answer_stream(query, reranked)
    else:
        return await generate_answer(query, reranked)