"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Message } from "@/types"
import { Brain, Send, Loader, FileText, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      background: "none", border: "none", cursor: "pointer",
      color: copied ? "#34d399" : "#475569", padding: "4px", borderRadius: "4px",
      display: "flex", alignItems: "center", transition: "color 0.15s",
    }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <div className="fade-in" style={{
      display: "flex", gap: "12px", marginBottom: "24px",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
        background: isUser ? "linear-gradient(135deg, #818cf8, #a78bfa)" : "rgba(255,255,255,0.06)",
        border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: "700", color: "white",
      }}>
        {isUser ? "S" : <Brain size={15} color="#818cf8" />}
      </div>
      <div style={{ maxWidth: "75%", minWidth: "80px" }}>
        <div style={{
          padding: "14px 18px",
          borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          background: isUser ? "linear-gradient(135deg, #818cf8, #a78bfa)" : "rgba(255,255,255,0.04)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.07)",
          color: "white", fontSize: "14px", lineHeight: 1.7,
        }}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose-dark">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", paddingLeft: "4px" }}>
            <CopyButton text={msg.content} />
            <span style={{ fontSize: "11px", color: "#334155" }}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const chatId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }
    fetchMessages()
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingText])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://127.0.0.1:8000/api/v1/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMessages(data)
    } catch { router.push("/dashboard") }
  }

  const sendMessage = async () => {
  if (!input.trim() || streaming) return

  const userMsg = input.trim()

  setInput("")
  setStreaming(true)
  setStreamingText("")

  if (textareaRef.current) {
    textareaRef.current.style.height = "52px"
  }

  const tempUserMessage: Message = {
    id: Date.now().toString(),
    chat_id: chatId,
    role: "user",
    content: userMsg,
    created_at: new Date().toISOString(),
  }

  setMessages((prev) => [...prev, tempUserMessage])

  try {
    const token = localStorage.getItem("token")

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/chats/${chatId}/messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: userMsg,
        }),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to stream response")
    }

    if (!response.body) {
      throw new Error("No response body")
    }

    const reader = response.body.getReader()

    const decoder = new TextDecoder()

    let fullText = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })

      fullText += chunk

      setStreamingText(fullText)
    }

    const assistantMessage: Message = {
      id: Date.now().toString() + "-assistant",
      chat_id: chatId,
      role: "assistant",
      content: fullText,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    setStreamingText("")
  } catch (err) {
    console.error(err)

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-error",
        chat_id: chatId,
        role: "assistant",
        content:
          "Something went wrong while generating the response. Please try again.",
        created_at: new Date().toISOString(),
      },
    ])
  } finally {
    setStreaming(false)
  }
}

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{
        padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: "10px", flexShrink: 0,
        background: "#0a0a12",
      }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "8px",
          background: "linear-gradient(135deg, #818cf8, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Brain size={14} color="white" />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "white" }}>NexoraSpace Chat</div>
          <div style={{ fontSize: "11px", color: "#475569" }}>Powered by Groq + RAG</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "28px 0" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
          {messages.length === 0 && !streaming && (
            <div className="fade-in" style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "16px",
                background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <Brain size={26} color="white" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "white", marginBottom: "8px" }}>
                Ask anything about your documents
              </h2>
              <p style={{ color: "#475569", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                Get AI-powered answers with page citations. Ask questions, request summaries, or explore concepts.
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
                {[
                  "Summarize this document",
                  "What are the key findings?",
                  "List the main concepts",
                ].map((q) => (
                  <button key={q} onClick={() => setInput(q)} style={{
                    padding: "7px 14px", borderRadius: "999px", fontSize: "12px",
                    background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.15)",
                    color: "#818cf8", cursor: "pointer",
                  }}>{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.filter(m => m.content).map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {streamingText && (
            <div className="fade-in" style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brain size={15} color="#818cf8" />
              </div>
              <div style={{
                maxWidth: "75%", padding: "14px 18px",
                borderRadius: "4px 18px 18px 18px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                color: "white", fontSize: "14px", lineHeight: 1.7,
              }}>
                <div className="prose-dark">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
                <span style={{
                  display: "inline-block", width: "2px", height: "14px",
                  background: "#818cf8", marginLeft: "2px", verticalAlign: "middle",
                  animation: "blink 1s infinite",
                }} />
              </div>
            </div>
          )}

          {streaming && !streamingText && (
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brain size={15} color="#818cf8" />
              </div>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "7px", height: "7px", borderRadius: "50%", background: "#818cf8",
                    animation: `pulse-dot 1.2s ease infinite ${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{
        flexShrink: 0, padding: "16px 24px 20px",
        borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0a0a12",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-end",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "14px", padding: "10px 12px",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: "14px", resize: "none",
                fontFamily: "inherit", lineHeight: 1.6, minHeight: "24px",
                maxHeight: "140px", overflowY: "auto",
              }}
            />
            <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "none",
              flexShrink: 0,
              cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
              background:
                streaming || !input.trim()
                  ? "rgba(129,140,248,0.2)"
                  : "linear-gradient(135deg, #818cf8, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            {streaming ? (
              <Loader size={16} color="white" className="spin" />
            ) : (
              <Send size={16} color="white" />
            )}
          </button>
          </div>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#334155", marginTop: "8px" }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}