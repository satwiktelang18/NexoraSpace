export interface User {
  id: string
  name: string
  email: string
  is_active: boolean
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface Document {
  id: string
  workspace_id: string
  file_name: string
  storage_url: string | null
  status: "pending" | "processing" | "ready" | "failed" | "failed_no_text"
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface Chat {
  id: string
  workspace_id: string
  user_id: string
  title: string
  created_at: string
}

export interface Agent {
  id: string
  name: string
  type: "researcher" | "summarizer" | "citation"
  status: "idle" | "running" | "done" | "error"
  output?: string
}

export interface Member {
  id: string
  name: string
  email: string
  role: "owner" | "member"
}