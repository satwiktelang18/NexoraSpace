"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/api"
import { useWorkspaceStore } from "@/store/workspace"
import { Workspace } from "@/types"
import {
  Brain, MessageSquare, FolderOpen, Zap,
  Settings, LogOut, ChevronDown, ChevronRight,
  Folder, Hash
} from "lucide-react"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    workspaces, setWorkspaces,
    activeWorkspace, setActiveWorkspace,
    chats, setChats,
    activeChat, setActiveChat
  } = useWorkspaceStore()

  const [user, setUser] = useState<any>(null)
  const [expandedWs, setExpandedWs] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newWsName, setNewWsName] = useState("")
  const [showNewWs, setShowNewWs] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces")
      setWorkspaces(res.data)
      if (res.data.length > 0 && !activeWorkspace) {
        setExpandedWs(res.data[0].id)
      }
    } catch {}
  }

  const loadChats = async (wsId: string) => {
    try {
      const res = await api.get(`/workspaces/${wsId}/chats`)
      setChats(res.data)
    } catch {
      setChats([])
    }
  }

  const handleWorkspaceClick = (ws: Workspace) => {
    if (expandedWs === ws.id) {
      setExpandedWs(null)
    } else {
      setExpandedWs(ws.id)
      setActiveWorkspace(ws)
      loadChats(ws.id)
    }
  }

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    setCreating(true)
    try {
      const res = await api.post("/workspaces", { name: newWsName })
      setWorkspaces([...workspaces, res.data])
      setNewWsName("")
      setShowNewWs(false)
      setExpandedWs(res.data.id)
      setActiveWorkspace(res.data)
    } finally {
      setCreating(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
  }

  return (
    <aside style={{
      width: "248px", flexShrink: 0, height: "100vh",
      background: "#0c0c14", borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "linear-gradient(135deg, #818cf8, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Brain size={17} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "white", lineHeight: 1.2 }}>NexoraSpace</div>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: 1.2 }}>AI Research OS</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "10px 10px 6px" }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 6px 8px" }}>
          Navigation
        </div>
        {[
          { icon: FolderOpen, label: "Workspaces", path: "/dashboard" },
          { icon: Zap, label: "Agents", path: "/agents" },
          { icon: Settings, label: "Settings", path: "/settings" },
        ].map((item) => (
          <button key={item.path} className={`sidebar-item ${pathname === item.path ? "active" : ""}`}
            onClick={() => router.push(item.path)}>
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "6px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px 8px" }}>
          <div style={{ fontSize: "10px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Workspaces
          </div>
          <button onClick={() => setShowNewWs(!showNewWs)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#475569", padding: "2px", borderRadius: "4px",
            display: "flex", alignItems: "center",
          }}>
          </button>
        </div>

        {showNewWs && (
          <form onSubmit={createWorkspace} style={{ marginBottom: "8px", padding: "0 2px" }}>
            <input
              autoFocus
              className="input-base"
              style={{ fontSize: "12px", padding: "7px 10px", marginBottom: "6px" }}
              placeholder="Workspace name..."
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              <button type="submit" disabled={creating} className="btn-primary" style={{ fontSize: "12px", padding: "5px 12px", flex: 1 }}>
                {creating ? "..." : "Create"}
              </button>
              <button type="button" className="btn-ghost" style={{ fontSize: "12px", padding: "5px 10px" }}
                onClick={() => setShowNewWs(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {workspaces.length === 0 ? (
          <div style={{ padding: "20px 8px", textAlign: "center" }}>
            <Folder size={24} color="#334155" style={{ margin: "0 auto 8px", display: "block" }} />
            <p style={{ fontSize: "12px", color: "#475569" }}>No workspaces yet</p>
          </div>
        ) : (
          workspaces.map((ws) => (
            <div key={ws.id}>
              <button
                className={`sidebar-item ${activeWorkspace?.id === ws.id ? "active" : ""}`}
                onClick={() => handleWorkspaceClick(ws)}
                style={{ justifyContent: "space-between" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <Folder size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" }}>
                    {ws.name}
                  </span>
                </div>
                {expandedWs === ws.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {expandedWs === ws.id && (
                <div style={{ paddingLeft: "12px", marginBottom: "4px" }}>
                  <button
                    className="sidebar-item"
                    style={{ fontSize: "12px", color: "#64748b", gap: "6px" }}
                    onClick={() => router.push(`/workspace/${ws.id}`)}
                  >
                    <FolderOpen size={12} /> Documents & Settings
                  </button>
                  {chats.filter(c => c.workspace_id === ws.id).map((chat) => (
                    <button
                      key={chat.id}
                      className={`sidebar-item ${activeChat?.id === chat.id ? "active" : ""}`}
                      style={{ fontSize: "12px", gap: "6px" }}
                      onClick={() => { setActiveChat(chat); router.push(`/chat/${chat.id}`) }}
                    >
                      <Hash size={11} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chat.title || "New Chat"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: "10px 12px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #818cf8, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "700", color: "white",
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </div>
              <div style={{ fontSize: "10px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
            </div>
          </div>
        )}
        <button className="sidebar-item" style={{ color: "#ef4444", fontSize: "12px" }} onClick={logout}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  )
}