"use client"

import { Settings, User, Key, Bell, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const [loading, setLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem("user")

    if (u) {
      const parsed = JSON.parse(u)

      setUser(parsed)
      setName(parsed.name || "")
      setEmail(parsed.email || "")
    }
  }, [])

  const handleSaveProfile = async () => {
    try {
      setLoading(true)

      const response = await api.put("/auth/me", {
        name,
        email,
      })

      const updatedUser = response.data

      localStorage.setItem("user", JSON.stringify(updatedUser))

      setUser(updatedUser)

      alert("Profile updated successfully!")
    } catch (err: any) {
      console.error(err)

      alert(err.response?.data?.detail || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
  try {
    setPasswordLoading(true)

    await api.put("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    })

    setCurrentPassword("")
    setNewPassword("")

    alert("Password updated successfully!")
  } catch (err: any) {
    console.error(err)

    alert(err.response?.data?.detail || "Failed to change password")
  } finally {
    setPasswordLoading(false)
  }
}

  return (
    <div style={{ flex: 1, overflow: "auto", padding: "40px 48px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(129,140,248,0.15)",
                border: "1px solid rgba(129,140,248,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Settings size={18} color="#818cf8" />
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "white",
              }}
            >
              Settings
            </h1>
          </div>

          <p style={{ color: "#475569", fontSize: "15px" }}>
            Manage your account and preferences.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* PROFILE SECTION */}

          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px",
              padding: "22px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <User size={16} color="#818cf8" />

              <h2
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "white",
                }}
              >
                Profile
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Name
                </label>

                <input
                  className="input-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "6px",
                    display: "block",
                  }}
                >
                  Email
                </label>

                <input
                  className="input-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                style={{
                  marginTop: "8px",
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* OTHER SECTIONS */}

{[
  {
    icon: Key,
    title: "API Keys",
    desc: "Manage your OpenAI and Groq API keys",
  },
].map((section) => (
  <div
    key={section.title}
    style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "18px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      transition: "0.2s",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <section.icon size={16} color="#475569" />

      <div>
        <p
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#e2e8f0",
          }}
        >
          {section.title}
        </p>

        <p
          style={{
            fontSize: "12px",
            color: "#475569",
          }}
        >
          {section.desc}
        </p>
      </div>
    </div>

    <div
      style={{
        fontSize: "18px",
        color: "#334155",
      }}
    >
      ›
    </div>
  </div>
))}

{/* SECURITY SECTION */}

<div
  style={{
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "22px 24px",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "16px",
    }}
  >
    <Shield size={16} color="#818cf8" />

    <h2
      style={{
        fontSize: "14px",
        fontWeight: "600",
        color: "white",
      }}
    >
      Security
    </h2>
  </div>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}
  >
    <div>
      <label
        style={{
          fontSize: "12px",
          color: "#64748b",
          marginBottom: "6px",
          display: "block",
        }}
      >
        Current Password
      </label>

      <input
        type="password"
        className="input-base"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
    </div>

    <div>
      <label
        style={{
          fontSize: "12px",
          color: "#64748b",
          marginBottom: "6px",
          display: "block",
        }}
      >
        New Password
      </label>

      <input
        type="password"
        className="input-base"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
    </div>

    <button
      onClick={handleChangePassword}
      disabled={passwordLoading}
      style={{
        marginTop: "8px",
        background: "#6366f1",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: "600",
        cursor: "pointer",
        opacity: passwordLoading ? 0.7 : 1,
      }}
    >
      {passwordLoading ? "Updating..." : "Change Password"}
    </button>
  </div>
</div>
        </div>
      </div>
    </div>
  )
}