"use client"
import { Zap, Brain, Search, FileText, Clock } from "lucide-react"

export default function AgentsPage() {
  return (
    <div style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={18} color="white" />
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "white" }}>AI Agents</h1>
          </div>
          <p style={{ color: "#475569", fontSize: "15px" }}>
            Autonomous agents that research, summarize, and analyze your documents.
          </p>
        </div>

        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: "16px", padding: "24px 28px", marginBottom: "32px",
          display: "flex", alignItems: "center", gap: "16px",
        }}>
          <Clock size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "#f59e0b", marginBottom: "2px" }}>
              Coming in Phase 2
            </p>
            <p style={{ fontSize: "13px", color: "#78350f" }}>
              Multi-agent orchestration is under active development. Upload documents and start chatting while agents are being built.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {[
            {
              icon: Search, name: "Researcher Agent",
              desc: "Autonomously searches through documents, extracts key information, and compiles research reports.",
              color: "#818cf8", status: "Coming soon",
            },
            {
              icon: Brain, name: "Summarizer Agent",
              desc: "Condenses long documents into structured summaries with key takeaways and bullet points.",
              color: "#a78bfa", status: "Coming soon",
            },
            {
              icon: FileText, name: "Citation Agent",
              desc: "Validates references, attaches page citations, and ensures every claim is backed by source material.",
              color: "#34d399", status: "Coming soon",
            },
          ].map((agent) => (
            <div key={agent.name} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px", padding: "22px", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "12px", right: "12px",
                fontSize: "10px", padding: "3px 8px", borderRadius: "999px",
                background: "rgba(255,255,255,0.06)", color: "#475569", fontWeight: "500",
              }}>
                {agent.status}
              </div>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px", marginBottom: "14px",
                background: `${agent.color}18`, border: `1px solid ${agent.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <agent.icon size={17} color={agent.color} />
              </div>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "8px" }}>
                {agent.name}
              </h3>
              <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>{agent.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}