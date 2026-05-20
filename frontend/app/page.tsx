import Link from "next/link"
import { Brain, Zap, GitBranch, Search } from "lucide-react"

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh", background: "#08080f",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "720px", width: "100%", textAlign: "center", position: "relative" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 16px", borderRadius: "999px", marginBottom: "32px",
          background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)",
          color: "#818cf8", fontSize: "13px", fontWeight: "500",
        }}>
          <Zap size={13} />
          AI Research Operating System
        </div>

        <h1 style={{
          fontSize: "clamp(48px, 8vw, 80px)", fontWeight: "800",
          marginBottom: "24px", lineHeight: 1.05, letterSpacing: "-0.03em",
        }}>
          <span style={{ color: "white" }}>Research at the</span>
          <br />
          <span className="gradient-text">speed of thought</span>
        </h1>

        <p style={{
          fontSize: "18px", color: "#64748b", marginBottom: "48px",
          lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 48px",
        }}>
          Upload documents, deploy AI agents, extract knowledge graphs,
          and get cited answers — all in one workspace.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "80px" }}>
          <Link href="/register" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px", borderRadius: "12px" }}>
            Start for free
          </Link>
          <Link href="/login" className="btn-ghost" style={{ padding: "14px 32px", fontSize: "15px", borderRadius: "12px" }}>
            Sign in
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { icon: Brain, label: "RAG Pipeline", desc: "Semantic search across all your documents" },
            { icon: Zap, label: "AI Agents", desc: "Multi-agent research and summarization" },
            { icon: GitBranch, label: "Knowledge Graph", desc: "Visual entity and relationship mapping" },
            { icon: Search, label: "Citations", desc: "Every answer backed by sources" },
          ].map((f) => (
            <div key={f.label} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px", padding: "20px 16px", textAlign: "left",
            }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px",
              }}>
                <f.icon size={16} color="#818cf8" />
              </div>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0", marginBottom: "4px" }}>{f.label}</div>
              <div style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}