import fitz
from typing import List
from app.services.rag.chunker import clean_text, chunk_text


def extract_text_from_pdf(file_path: str) -> List[dict]:
    doc = fitz.open(file_path)
    pages = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        
        text = page.get_text("text")
        
        if not text.strip():
            text = page.get_text("blocks")
            if isinstance(text, list):
                text = " ".join([b[4] for b in text if isinstance(b[4], str)])
        
        if not text.strip():
            text = page.get_text("dict")
            if isinstance(text, dict):
                extracted = []
                for block in text.get("blocks", []):
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            extracted.append(span.get("text", ""))
                text = " ".join(extracted)

        if text.strip():
            pages.append({
                "page_number": page_num + 1,
                "text": clean_text(text),
            })

    doc.close()
    return pages


def extract_chunks_from_pdf(file_path: str) -> List[dict]:
    pages = extract_text_from_pdf(file_path)
    
    if not pages:
        return _extract_raw_fallback(file_path)
    
    all_chunks = []
    chunk_index = 0

    for page in pages:
        chunks = chunk_text(page["text"])
        for chunk in chunks:
            if chunk.strip():
                all_chunks.append({
                    "chunk_text": chunk,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                })
                chunk_index += 1

    return all_chunks


def _extract_raw_fallback(file_path: str) -> List[dict]:
    doc = fitz.open(file_path)
    all_text = ""
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        words = page.get_text("words")
        if words:
            page_text = " ".join([w[4] for w in words if isinstance(w[4], str)])
            all_text += page_text + " "
    
    doc.close()
    
    if not all_text.strip():
        return []
    
    cleaned = clean_text(all_text)
    chunks = chunk_text(cleaned)
    
    return [
        {
            "chunk_text": chunk,
            "page_number": 1,
            "chunk_index": i,
        }
        for i, chunk in enumerate(chunks)
        if chunk.strip()
    ]