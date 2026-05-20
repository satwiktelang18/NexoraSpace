import { create } from "zustand"
import { Workspace, Chat, Document } from "@/types"

interface WorkspaceStore {
  activeWorkspace: Workspace | null
  activeChat: Chat | null
  workspaces: Workspace[]
  chats: Chat[]
  documents: Document[]
  rightPanel: "documents" | "sources" | "memory" | "agents"
  sidebarOpen: boolean
  setActiveWorkspace: (w: Workspace | null) => void
  setActiveChat: (c: Chat | null) => void
  setWorkspaces: (w: Workspace[]) => void
  setChats: (c: Chat[]) => void
  setDocuments: (d: Document[]) => void
  setRightPanel: (p: "documents" | "sources" | "memory" | "agents") => void
  setSidebarOpen: (open: boolean) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspace: null,
  activeChat: null,
  workspaces: [],
  chats: [],
  documents: [],
  rightPanel: "documents",
  sidebarOpen: true,
  setActiveWorkspace: (w) => set({ activeWorkspace: w }),
  setActiveChat: (c) => set({ activeChat: c }),
  setWorkspaces: (w) => set({ workspaces: w }),
  setChats: (c) => set({ chats: c }),
  setDocuments: (d) => set({ documents: d }),
  setRightPanel: (p) => set({ rightPanel: p }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))