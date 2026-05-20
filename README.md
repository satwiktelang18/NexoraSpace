<div align="center">

<img src="https://img.shields.io/badge/Next.js-15-white?style=for-the-badge&logo=next.js&logoColor=black"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Python-3.11-FFD43B?style=for-the-badge&logo=python&logoColor=black"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/RAG-Pipeline-8B5CF6?style=for-the-badge&logoColor=white"/>
<img src="https://img.shields.io/badge/Status-In%20Progress-F59E0B?style=for-the-badge"/>

<br/><br/>

# NexoraSpace — AI Research Operating System

**Upload documents, deploy AI agents, extract knowledge graphs, and get cited answers — all in one workspace.**

</div>

---

## Overview 🔭

NexoraSpace is a full-stack **AI Research Operating System** that transforms how you interact with your documents. Built on a **RAG (Retrieval-Augmented Generation)** pipeline, it lets you upload PDFs, ask research-grade questions, and receive **cited, source-backed answers** — with semantic search, multi-agent orchestration, and knowledge graph extraction, all within collaborative workspaces.

---

## Features ✨

- 📁 Upload **PDF documents** to isolated, named workspaces
- 🔍 **Semantic search** across all documents using vector embeddings
- 🤖 **Multi-agent AI** for deep research and summarization
- 🕸️ **Knowledge Graph** — visual entity and relationship mapping *(coming soon)*
- 📌 **Page-level citations** — every answer backed by exact sources
- 💬 **Multi-doc queries** — ask questions spanning multiple documents
- 👥 **Team collaboration** — share workspaces and invite members
- ⚡ Answers indexed and ready in **10–30 seconds**

---

## Architecture Overview 🧠

User
│
├── Next.js Frontend (localhost:3000)
│     ├── Workspace Manager
│     ├── Document Upload UI
│     ├── AI Chat Interface (with citations)
│     └── Agent Dashboard
│
└── FastAPI Backend (localhost:8000)
├── Auth & User Management
├── Workspace & Document Models (PostgreSQL)
├── Embedding Service → pgvector
├── RAG Pipeline → Retrieval + Reranking
├── AI Agent Workers
└── Knowledge Graph Extractor

---

## How It Works 🔬

| Step | Action |
|------|--------|
| 1 | Upload a digital PDF → stored and chunked by the backend |
| 2 | Chunks embedded via embedding service → stored in vector DB |
| 3 | Status turns **Ready** (10–30s) — document is indexed |
| 4 | User sends a query via the Chat interface |
| 5 | Query embedded → **semantic search** retrieves top-k chunks |
| 6 | Reranker re-scores chunks for relevance |
| 7 | LLM generates an answer grounded in retrieved chunks |
| 8 | Response returned with **page-level citations** |

---

## Project Structure 🏗️

NexoraSpace/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── document.py         # Document ORM model (UUID, status, workspace FK)
│   │   │   ├── chunk.py            # DocumentChunk model (text, page, embedding index)
│   │   │   ├── user.py             # User model
│   │   │   ├── workspace.py        # Workspace model
│   │   │   └── workspace_member.py # Team membership
│   │   ├── chat.py                 # Chat session handler
│   │   └── pipeline.py             # RAG orchestration
│   ├── services/
│   │   ├── embeddings/             # Text → vector embeddings
│   │   ├── rag/                    # Core RAG logic
│   │   ├── reranking/              # Chunk reranker
│   │   ├── retrieval/              # Vector store retrieval
│   │   └── workers/                # Background job workers
│   ├── utils/
│   ├── main.py                     # FastAPI entry point
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── agents/             # AI Agent dashboard
│   │   │   ├── chat/               # Chat interface with citations
│   │   │   ├── dashboard/          # User dashboard
│   │   │   ├── settings/           # User/workspace settings
│   │   │   └── workspace/          # Workspace view & document manager
│   │   ├── components/
│   │   │   ├── citations/          # Citation display components
│   │   │   ├── sidebar/            # Navigation sidebar
│   │   │   └── upload/             # PDF upload dropzone
│   │   ├── layout.tsx
│   │   └── page.tsx                # Landing page
│   ├── lib/
│   ├── store/
│   ├── types/
│   ├── globals.css
│   └── next.config.ts
│
├── docker-compose.yml
├── .env
└── README.md

---

## Tech Stack 🛠️

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + TypeScript | UI framework with App Router |
| **Styling** | Tailwind CSS | Dark-themed, utility-first design |
| **Backend** | FastAPI (Python 3.11) | REST API + async request handling |
| **ORM** | SQLAlchemy | Database models & relationships |
| **Database** | PostgreSQL 16 | Primary relational store |
| **Vector Store** | pgvector / custom | Embedding storage & ANN search |
| **Embeddings** | Embedding Service | Chunk-level dense vector generation |
| **Reranking** | Reranker Service | Relevance scoring of retrieved chunks |
| **AI/LLM** | LLM via API | Answer generation with citations |
| **Auth** | Custom JWT | User sessions & workspace access |
| **Infra** | Docker Compose | Containerized local dev environment |

---

## AI Capabilities 🤖

| Capability | Status | Description |
|-----------|--------|-------------|
| 🔍 Semantic Search | ✅ Live | Dense vector search across all chunks in a workspace |
| 📌 Page Citations | ✅ Live | Every answer references the exact page and document |
| 📂 Multi-doc Queries | ✅ Live | Query across multiple uploaded documents at once |
| 👥 Team Collaboration | ✅ Live | Share workspaces; multiple users, one knowledge base |
| 🤖 AI Agents | ✅ Live | Multi-agent workflows for deep research & summarization |
| 🕸️ Knowledge Graph | 🚧 Coming Soon | Visual entity and relationship mapping from documents |

---

## Installation ⚙️

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 16
- Docker & Docker Compose (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd NexoraSpace
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Configure your `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexoraspace
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Or run everything with Docker

```bash
docker-compose up --build
```

Open your browser at `http://localhost:3000`

---

## Usage ▶️

1. **Register / Sign in** at `localhost:3000`
2. **Create a Workspace** (e.g., "Infinite Void")
3. **Upload a PDF** — drag & drop or click to browse *(digital PDFs only — scanned/handwritten won't work)*
4. **Wait ~10–30s** for the AI to index your document
5. **Click "New Chat"** and ask anything about your documents
6. Receive **cited, source-backed answers** with page references

---

## Document Status Lifecycle 📄

Uploaded → Processing → Embedding → Ready
|
Queryable via Chat

| Status | Meaning |
|--------|---------|
| `processing` | File received, chunking in progress |
| `pending` | Chunks created, waiting for embedding |
| `ready` | Fully indexed — available for semantic search |
| `failed` | Error during pipeline (check logs) |

---

## Roadmap 🚀

- [x] PDF upload & chunking pipeline
- [x] Vector embedding & semantic search
- [x] RAG pipeline with reranking
- [x] Page-level citations in answers
- [x] Multi-workspace support
- [x] User auth & team collaboration
- [x] AI Agent framework
- [x] Dark-themed Next.js UI
- [ ] Knowledge Graph visual explorer
- [ ] Multi-doc cross-workspace queries
- [ ] Downloadable research report (PDF export)
- [ ] Fine-tuned reranker for domain-specific docs
- [ ] Deploy on cloud (Vercel + Railway / AWS)
- [ ] Browser extension for one-click PDF import

---

## 👨‍💻 Author

**Satwik Telang**
