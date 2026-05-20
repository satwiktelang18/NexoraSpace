"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useWorkspaceStore } from "@/store/workspace"
import { Workspace } from "@/types"
import { Folder, Plus, MessageSquare, FileText, ArrowRight, Brain, Zap } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
    fetchWorkspaces()
  }, [])

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces")
      setWorkspaces(res.data)
    } finally {
      setLoading(false)
    }
  }

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await api.post("/workspaces", { name: newName })
      setWorkspaces([...workspaces, res.data])
      setNewName("")
      setShowForm(false)
      router.push(`/workspace/${res.data.id}`)
    } finally {
      setCreating(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "6px" }}>
            {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p style={{ color: "#475569", fontSize: "15px" }}>
            Your AI research workspace is ready.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "40px" }}>
          {[
            { icon: Folder, label: "Workspaces", value: workspaces.length, color: "#818cf8" },
            { icon: Brain, label: "AI Engine", value: "Active", color: "#34d399" },
            { icon: Zap, label: "Agents", value: "Ready", color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px", padding: "20px 22px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: `${stat.color}18`, border: `1px solid ${stat.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <stat.icon size={15} color={stat.color} />
                </div>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: "white" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "600", color: "white" }}>Workspaces</h2>
          <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}
            onClick={() => setShowForm(true)}>
            <Plus size={14} /> New workspace
          </button>
        </div>

        {showForm && (
          <form onSubmit={createWorkspace} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px", padding: "16px", marginBottom: "16px",
            display: "flex", gap: "10px",
          }}>
            <input
              autoFocus className="input-base" placeholder="Workspace name..."
              value={newName} onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" disabled={creating} className="btn-primary" style={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
              {creating ? "Creating..." : "Create"}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: "100px", borderRadius: "14px" }} />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px", margin: "0 auto 16px",
              background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Folder size={24} color="#818cf8" />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "white", marginBottom: "8px" }}>
              No workspaces yet
            </h3>
            <p style={{ color: "#475569", fontSize: "14px", marginBottom: "20px" }}>
              Create your first workspace to start researching
            </p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={15} /> Create workspace
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
            {workspaces.map((ws) => (
              <button key={ws.id}
                onClick={() => { setActiveWorkspace(ws); router.push(`/workspace/${ws.id}`) }}
                style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "14px", padding: "20px", textAlign: "left", cursor: "pointer",
                  transition: "all 0.15s", width: "100%",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(129,140,248,0.06)"
                  ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(129,140,248,0.2)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"
                  ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Folder size={18} color="white" />
                  </div>
                  <ArrowRight size={15} color="#475569" />
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "4px" }}>
                  {ws.name}
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>
                  {new Date(ws.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}