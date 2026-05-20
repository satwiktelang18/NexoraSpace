"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
  }, [])

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#08080f" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  )
}