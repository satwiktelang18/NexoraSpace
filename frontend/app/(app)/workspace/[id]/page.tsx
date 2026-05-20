"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import { Workspace, Document } from "@/types"
import { Upload, MessageSquare, Trash2, FileText, Loader, AlertCircle, Users, Plus, Brain } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useWorkspaceStore } from "@/store/workspace"

function UploadGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.8)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div style={{
        background: "#13131f", border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: "18px", padding: "32px", maxWidth: "500px", width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertCircle size={20} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>No Text Could Be Extracted</h2>
            <p style={{ fontSize: "12px", color: "#64748b" }}>This PDF appears to be image-based or scanned</p>
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "10px", padding: "16px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { icon: "✅", text: "Digital text PDFs — where you can select and copy text" },
              { icon: "✅", text: "Downloaded papers, articles, reports, Word exports" },
              { icon: "✅", text: "Under 10MB, fewer than 50 pages" },
              { icon: "❌", text: "Scanned documents or photos of pages" },
              { icon: "❌", text: "Handwritten notes or image-only slides" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "13px", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Got it — Upload Different PDF
        </button>
      </div>
    </div>
  )
}

function MembersPanel({ workspaceId, isOwner }: { workspaceId: string, isOwner: boolean }) {
  const [members, setMembers] = useState<any[]>([])
  const [owner, setOwner] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`)
      setOwner(res.data.owner)
      setMembers(res.data.members)
    } catch {}
  }

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(""); setError("")
    try {
      const res = await api.post(`/workspaces/${workspaceId}/invite`, { email })
      setMsg(res.data.message); setEmail(""); fetchMembers()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to invite")
    } finally { setLoading(false) }
  }

  const remove = async (userId: string) => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`)
    fetchMembers()
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        Team Members
      </h3>
      {isOwner && (
        <form onSubmit={invite} style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Invite by email..." className="input-base" style={{ fontSize: "12px", padding: "8px 10px" }} required />
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "8px 14px", fontSize: "12px", whiteSpace: "nowrap" }}>
            {loading ? "..." : "Invite"}
          </button>
        </form>
      )}
      {msg && <p style={{ fontSize: "12px", color: "#34d399", marginBottom: "8px" }}>{msg}</p>}
      {error && <p style={{ fontSize: "12px", color: "#ef4444", marginBottom: "8px" }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {owner && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "white" }}>
                {owner.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>{owner.name}</p>
                <p style={{ fontSize: "10px", color: "#64748b" }}>{owner.email}</p>
              </div>
            </div>
            <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "999px", background: "rgba(129,140,248,0.15)", color: "#818cf8", fontWeight: "600" }}>Owner</span>
          </div>
        )}
        {members.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "white" }}>
                {m.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>{m.name}</p>
                <p style={{ fontSize: "10px", color: "#64748b" }}>{m.email}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", color: "#64748b", fontWeight: "600" }}>Member</span>
              {isOwner && (
                <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "11px" }}>Remove</button>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p style={{ fontSize: "12px", color: "#334155", textAlign: "center", padding: "10px" }}>No members yet</p>
        )}
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { setActiveWorkspace } = useWorkspaceStore()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [creatingChat, setCreatingChat] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")
  const [activeTab, setActiveTab] = useState<"documents" | "members">("documents")

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setCurrentUserId(JSON.parse(u).id)
    fetchAll()
  }, [id])

  useEffect(() => {
    if (documents.some(d => d.status === "failed_no_text")) setShowGuide(true)
  }, [documents])

  useEffect(() => {
    if (documents.some(d => d.status === "pending" || d.status === "processing")) {
      const interval = setInterval(async () => {
        const res = await api.get(`/workspaces/${id}/documents`)
        setDocuments(res.data)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [documents])

  const fetchAll = async () => {
    try {
      const [wsRes, docsRes] = await Promise.all([
        api.get(`/workspaces/${id}`),
        api.get(`/workspaces/${id}/documents`),
      ])
      setWorkspace(wsRes.data)
      setActiveWorkspace(wsRes.data)
      setDocuments(docsRes.data)
    } catch { router.push("/dashboard") }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    "application/pdf": [".pdf"],
  },

  multiple: false,

  maxSize: 10 * 1024 * 1024,

  onDrop: async (files, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0]

      if (error.code === "file-too-large") {
        alert("PDF size must be under 10MB")
      } else if (error.code === "file-invalid-type") {
        alert("Only PDF files are allowed")
      } else {
        alert("Invalid file")
      }

      return
    }

    if (!files[0]) return

    setUploading(true)

    try {
      const formData = new FormData()

      formData.append("file", files[0])

      const res = await api.post(
        `/workspaces/${id}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      setDocuments((prev) => [...prev, res.data])

    } catch (err: any) {
      console.error(err)

      alert(
        err.response?.data?.detail ||
        "Upload failed"
      )

    } finally {
      setUploading(false)
    }
  },
})

  const deleteDocument = async (docId: string) => {
    await api.delete(`/workspaces/${id}/documents/${docId}`)
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  const createChat = async () => {
    setCreatingChat(true)
    try {
      const res = await api.post("/chats", { workspace_id: id, title: "New Chat" })
      router.push(`/chat/${res.data.id}`)
    } finally { setCreatingChat(false) }
  }

  const statusColor = (s: string) => s === "ready" ? "#34d399" : s.includes("failed") ? "#ef4444" : s === "processing" ? "#f59e0b" : "#475569"
  const statusLabel = (s: string) => s === "ready" ? "✓ Ready" : s === "processing" ? "⟳ Processing..." : s === "failed_no_text" ? "✗ No text — try another PDF" : s === "failed" ? "✗ Failed" : "◷ Pending..."
  const readyDocs = documents.filter(d => d.status === "ready")
  const isOwner = workspace?.owner_id === currentUserId

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {showGuide && <UploadGuideModal onClose={() => setShowGuide(false)} />}

      <div style={{ flex: 1, overflow: "auto", padding: "36px 40px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#475569", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Workspace</div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "white" }}>{workspace?.name || "Loading..."}</h1>
            </div>
            <button onClick={createChat} disabled={creatingChat || readyDocs.length === 0} className="btn-primary">
              <MessageSquare size={15} />
              {creatingChat ? "Creating..." : readyDocs.length === 0 ? "Upload doc first" : "New Chat"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {(["documents", "members"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "8px", borderRadius: "7px", border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: "500", transition: "all 0.15s",
                background: activeTab === tab ? "rgba(129,140,248,0.15)" : "none",
                color: activeTab === tab ? "#818cf8" : "#64748b",
              }}>
                {tab === "documents" ? "Documents" : "Team"}
              </button>
            ))}
          </div>

          {activeTab === "documents" && (
            <>
              <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "14px", padding: "40px 24px", textAlign: "center",
                cursor: "pointer", marginBottom: "12px", transition: "all 0.2s",
                background: isDragActive ? "rgba(129,140,248,0.06)" : "rgba(255,255,255,0.01)",
              }}>
                <input {...getInputProps()} />
                {uploading ? (
                  <div style={{ color: "#818cf8" }}>
                    <Loader size={28} style={{ margin: "0 auto 10px", display: "block" }} />
                    <p style={{ fontSize: "14px", fontWeight: "500" }}>Uploading and indexing...</p>
                  </div>
                ) : (
                  <>
                    <Upload size={28} color="#818cf8" style={{ margin: "0 auto 10px", display: "block" }} />
                    <p style={{ color: "white", fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>
                      {isDragActive ? "Drop PDF here" : "Drag & drop PDF here"}
                    </p>
                    <p style={{ color: "#475569", fontSize: "13px" }}>or click to browse</p>
                  </>
                )}
              </div>

              <div style={{
                    background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.12)",
                    borderRadius: "10px", padding: "10px 14px", marginBottom: "20px",
                    display: "flex", alignItems: "center", gap: "10px",
                }}>
              <span style={{ fontSize: "13px", flexShrink: 0 }}>💡</span>
                        <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>
                        For best results use digital text PDFs — research papers, reports, Word exports work great. Scanned or handwritten docs won't work.
                    </p>
                </div>

              {documents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "#334155" }}>
                  <FileText size={32} style={{ margin: "0 auto 10px", display: "block" }} />
                  <p style={{ fontSize: "13px" }}>No documents yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {documents.map((doc) => (
                    <div key={doc.id} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${doc.status.includes("failed") ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: "10px", padding: "12px 16px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FileText size={15} color={doc.status === "ready" ? "#34d399" : doc.status.includes("failed") ? "#ef4444" : "#818cf8"} />
                        <div>
                          <p style={{ color: "#e2e8f0", fontWeight: "500", fontSize: "13px" }}>{doc.file_name}</p>
                          <p style={{ fontSize: "11px", color: statusColor(doc.status), marginTop: "2px" }}>{statusLabel(doc.status)}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {doc.status.includes("failed") && (
                          <button onClick={() => setShowGuide(true)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", color: "#ef4444", fontSize: "11px" }}>Why?</button>
                        )}
                        <button onClick={() => deleteDocument(doc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: "3px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {readyDocs.length > 0 && (
                <div style={{
                  marginTop: "16px", padding: "14px 18px", borderRadius: "10px",
                  background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)",
                }}>
                  <p style={{ color: "#34d399", fontWeight: "600", fontSize: "13px", marginBottom: "2px" }}>
                    ✓ {readyDocs.length} document{readyDocs.length > 1 ? "s" : ""} ready
                  </p>
                  <p style={{ color: "#475569", fontSize: "12px" }}>Click New Chat to start asking questions</p>
                </div>
              )}
            </>
          )}

          {activeTab === "members" && (
            <MembersPanel workspaceId={id} isOwner={isOwner} />
          )}
        </div>
      </div>

      <div style={{
        width: "280px", borderLeft: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 20px", overflow: "auto", background: "#0a0a12",
      }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
          How to use
        </div>
        {[
          { n: "1", t: "Upload a digital PDF", d: "Drag & drop or click to browse" },
          { n: "2", t: "Wait for Ready status", d: "AI indexes in 10-30 seconds" },
          { n: "3", t: "Click New Chat", d: "Start your research session" },
          { n: "4", t: "Ask anything", d: "Get cited AI-powered answers" },
        ].map((s) => (
          <div key={s.n} style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
            <div style={{
              width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #818cf8, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "700", color: "white",
            }}>{s.n}</div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0", marginBottom: "2px" }}>{s.t}</p>
              <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5 }}>{s.d}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: "24px", padding: "14px", borderRadius: "10px", background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Brain size={14} color="#818cf8" />
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#818cf8" }}>AI Capabilities</span>
          </div>
          {["Semantic search", "Page citations", "Multi-doc queries", "Team collaboration"].map((cap) => (
            <div key={cap} style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#34d399" }}>✓</span> {cap}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}