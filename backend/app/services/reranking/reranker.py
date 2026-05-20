from typing import List


def rerank_chunks(query: str, chunks: List[dict], top_k: int = 4) -> List[dict]:
    scored = []
    query_words = set(query.lower().split())

    for chunk in chunks:
        text = chunk.get("chunk_text", "").lower()
        score = chunk.get("score", 0)
        keyword_matches = sum(1 for word in query_words if word in text)
        combined_score = score + (keyword_matches * 0.05)
        scored.append({**chunk, "final_score": combined_score})

    scored.sort(key=lambda x: x["final_score"], reverse=True)
    return scored[:top_k]