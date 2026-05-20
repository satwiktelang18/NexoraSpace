"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { Brain, Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await api.post("/auth/login", form)
      setAuth(res.data.user, res.data.access_token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed")
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#08080f",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px", margin: "0 auto 16px",
            background: "linear-gradient(135deg, #818cf8, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Brain size={22} color="white" />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "white", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "#475569" }}>Sign in to NexoraSpace</p>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "18px", padding: "28px",
        }}>
          {error && (
            <div style={{
              marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", fontSize: "13px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block" }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-base" placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block" }}>Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-base" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "4px" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#475569", marginTop: "20px" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#818cf8", textDecoration: "none" }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}