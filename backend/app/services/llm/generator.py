from typing import List, AsyncGenerator
import httpx
from app.core.config import settings


SMALL_TALK = {
    "hi", "hey", "hello", "heyy", "heyyy",
    "good", "ok", "okay", "thanks",
    "thank you", "bye", "goodbye",
    "sup", "whats up", "cool", "nice",
    "great", "awesome", "fine",
    "yes", "no", "sure", "alright",
}


def is_small_talk(query: str) -> bool:
    q = query.lower().strip().rstrip("!?.")

    return q in SMALL_TALK or (
        len(q.split()) <= 2
        and not any(
            w in q
            for w in [
                "what",
                "how",
                "why",
                "when",
                "who",
                "where",
                "explain",
                "tell",
                "describe",
                "summarize",
                "summary",
                "list",
                "translate",
                "translation",
                "page",
                "pdf",
                "document",
                "paper",
                "author",
                "chapter",
                "section",
                "contents",
                "content",
                "main",
                "rate",
            ]
        )
    )


def build_prompt(query: str, chunks: List[dict]) -> str:
    chunks_sorted = sorted(
        chunks,
        key=lambda x: x.get("page_number") or 0
    )

    context_parts = []
    total_chars = 0

    for c in chunks_sorted:
        text = c.get("chunk_text", "")[:700]

        total_chars += len(text)

        if total_chars > 4000:
            break

        context_parts.append(
            f"[Page {c.get('page_number', '?')}]\n{text}"
        )

    context = "\n\n".join(context_parts)

    return f"""
You are NexoraSpace AI.

You are a highly intelligent PDF research assistant.

IMPORTANT RULES:
- ONLY answer using the provided document context.
- If the answer is not present in the context, clearly say:
  "I couldn't find this information in the uploaded documents."
- NEVER hallucinate.
- Keep answers concise but useful.
- Use markdown formatting.
- Mention page numbers whenever possible.
- For summaries or lists, use bullet points.
- For short factual questions, answer briefly.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{query}
"""


async def call_groq(
    messages: list,
    max_tokens: int = 512,
) -> str:

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": messages,
                "temperature": 0.2,
                "max_tokens": max_tokens,
            },
        )

        data = response.json()

        if "choices" not in data:
            error_msg = data.get("error", {}).get("message", str(data))

            if "rate_limit" in error_msg.lower():
                return (
                    "Rate limit reached. "
                    "Please wait a few seconds and try again."
                )

            return f"Error: {error_msg}"

        return data["choices"][0]["message"]["content"]


async def generate_answer(
    query: str,
    chunks: List[dict],
) -> str:

    if is_small_talk(query):
        return await call_groq(
            [
                {
                    "role": "system",
                    "content": (
                        "You are NexoraSpace AI. "
                        "Respond casually and briefly "
                        "in 1-2 short sentences."
                    ),
                },
                {
                    "role": "user",
                    "content": query,
                },
            ],
            max_tokens=60,
        )

    if not chunks:
        return (
            "I couldn't find relevant information "
            "inside the uploaded documents."
        )

    prompt = build_prompt(query, chunks)

    return await call_groq(
        [
            {
                "role": "system",
                "content": (
                    "You are NexoraSpace AI, "
                    "an advanced document analysis assistant."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        max_tokens=700,
    )


async def generate_answer_stream(
    query: str,
    chunks: List[dict],
) -> AsyncGenerator[str, None]:

    answer = await generate_answer(query, chunks)

    words = answer.split(" ")

    for i, word in enumerate(words):
        if i == 0:
            yield word
        else:
            yield " " + word