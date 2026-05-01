import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import * as api from "../api/index"
import Sidebar from "../components/Sidebar"

export default function MessagesPage() {
  const { user: me } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => { fetchConversations() }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id)
      // Poll for new messages every 3 seconds
      pollRef.current = setInterval(() => fetchMessages(selectedUser._id), 3000)
    }
    return () => clearInterval(pollRef.current)
  }, [selectedUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const { data } = await api.getConversations()
      setConversations(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchMessages = async (userId) => {
    try {
      const { data } = await api.getMessages(userId)
      setMessages(data)
    } catch (e) { console.error(e) }
  }

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return
    setSending(true)
    try {
      const { data } = await api.sendMessage(selectedUser._id, text.trim())
      setMessages(prev => [...prev, data])
      setText("")
    } catch (e) { console.error(e) }
    setSending(false)
  }

  const handleSearch = async (e) => {
    const q = e.target.value
    setSearchQ(q)
    if (q.trim().length < 2) { setSearchResults([]); return }
    try {
      const { data } = await api.searchUsers(q)
      setSearchResults(data)
    } catch (e) { console.error(e) }
  }

  const selectConversationUser = (u) => {
    setSelectedUser(u)
    setSearchQ("")
    setSearchResults([])
  }

  const timeStr = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const dayStr = (date) => {
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return "Today"
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #1D9E75 !important; }
        input::placeholder { color: #4a6b56; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #1D9E7530; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <Sidebar active="messages" />

      {/* Conversation list */}
      <div style={s.convPanel}>
        <div style={s.convHeader}>
          <h2 style={s.convTitle}>Messages</h2>
          <p style={s.convSub}>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Search to start new chat */}
        <div style={s.searchWrap}>
          <input
            value={searchQ}
            onChange={handleSearch}
            placeholder="🔍 Search users to message..."
            style={s.searchInput}
          />
          {searchResults.length > 0 && (
            <div style={s.searchDropdown}>
              {searchResults.map(u => (
                <div key={u._id} style={s.searchItem} onClick={() => selectConversationUser(u)}>
                  <div style={s.convAvatar}>{u.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={s.convName}>{u.name}</div>
                    <div style={s.convRole}>{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div style={s.convList}>
          {loading ? (
            <div style={s.loadWrap}><div style={s.spinner} /></div>
          ) : conversations.length === 0 ? (
            <div style={s.emptyConv}>
              <div style={s.emptyIcon}>💬</div>
              <p style={s.emptyText}>No conversations yet.<br />Search for a user to start chatting.</p>
            </div>
          ) : (
            conversations.map(({ user, lastMessage }) => (
              <div
                key={user._id}
                style={{ ...s.convItem, ...(selectedUser?._id === user._id ? s.convItemActive : {}) }}
                onClick={() => selectConversationUser(user)}
              >
                <div style={s.convAvatar}>
                  {user.profilePic
                    ? <img src={user.profilePic} alt="" style={s.avatarImg} />
                    : user.name?.[0]?.toUpperCase()}
                </div>
                <div style={s.convInfo}>
                  <div style={s.convTop}>
                    <span style={s.convName}>{user.name}</span>
                    <span style={s.convTime}>{dayStr(lastMessage.createdAt)}</span>
                  </div>
                  <div style={s.convLast}>
                    {lastMessage.isFromMe && <span style={{ color: "#4a6b56" }}>You: </span>}
                    {lastMessage.content.length > 36
                      ? lastMessage.content.slice(0, 36) + "..."
                      : lastMessage.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      <div style={s.chatPanel}>
        {!selectedUser ? (
          <div style={s.noChatSelected}>
            <div style={s.noChatIcon}>💬</div>
            <h3 style={s.noChatTitle}>Select a conversation</h3>
            <p style={s.noChatSub}>Choose from your existing conversations or search for a user to start a new chat.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={s.chatHeader}>
              <div style={s.chatAvatar}>
                {selectedUser.profilePic
                  ? <img src={selectedUser.profilePic} alt="" style={s.avatarImg} />
                  : selectedUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={s.chatName}>{selectedUser.name}</div>
                <div style={s.chatRole}>
                  {selectedUser.role === "alumni" ? "✦ Alumni" : selectedUser.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={s.msgList}>
              {messages.length === 0 && (
                <div style={s.noMsgs}>
                  <span style={s.wavingHand}>👋</span>
                  <p style={s.noMsgsTxt}>No messages yet. Say hello!</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMine = msg.sender._id === me?._id || msg.sender === me?._id
                const showDate = i === 0 || dayStr(messages[i - 1].createdAt) !== dayStr(msg.createdAt)
                return (
                  <div key={msg._id || i}>
                    {showDate && (
                      <div style={s.dateDivider}>
                        <span style={s.dateBadge}>{dayStr(msg.createdAt)}</span>
                      </div>
                    )}
                    <div style={{ ...s.msgRow, ...(isMine ? s.msgRowMine : {}) }}>
                      {!isMine && (
                        <div style={s.msgAvatar}>{selectedUser.name?.[0]?.toUpperCase()}</div>
                      )}
                      <div style={{ ...s.msgBubble, ...(isMine ? s.msgBubbleMine : s.msgBubbleTheirs) }}>
                        <p style={s.msgText}>{msg.content}</p>
                        <span style={s.msgTime}>{timeStr(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={s.inputRow}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                style={s.msgInput}
              />
              <button
                style={{ ...s.sendBtn, opacity: sending || !text.trim() ? 0.5 : 1 }}
                onClick={handleSend}
                disabled={sending || !text.trim()}
              >
                ↗
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },

  convPanel: { width: 320, borderRight: "1px solid rgba(29,158,117,0.12)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, background: "rgba(8,12,9,0.98)", flexShrink: 0 },
  convHeader: { padding: "28px 20px 16px" },
  convTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#e8f0eb", marginBottom: 4 },
  convSub: { fontSize: 13, color: "#4a6b56" },

  searchWrap: { padding: "0 16px 12px", position: "relative" },
  searchInput: { width: "100%", background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  searchDropdown: { position: "absolute", left: 16, right: 16, top: "100%", background: "#0d1a10", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, zIndex: 50, overflow: "hidden" },
  searchItem: { display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", cursor: "pointer", transition: "background 0.15s" },

  convList: { flex: 1, overflowY: "auto" },
  loadWrap: { display: "flex", justifyContent: "center", padding: 40 },
  spinner: { width: 28, height: 28, border: "2px solid rgba(29,158,117,0.2)", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyConv: { textAlign: "center", padding: "60px 20px" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 14, color: "#4a6b56", lineHeight: 1.6 },

  convItem: { display: "flex", gap: 12, alignItems: "center", padding: "13px 20px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid rgba(29,158,117,0.06)" },
  convItemActive: { background: "rgba(29,158,117,0.1)", borderLeft: "3px solid #1D9E75" },
  convAvatar: { width: 44, height: 44, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, flexShrink: 0, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  convInfo: { flex: 1, minWidth: 0 },
  convTop: { display: "flex", justifyContent: "space-between", marginBottom: 3 },
  convName: { fontSize: 14, fontWeight: 600, color: "#e8f0eb" },
  convTime: { fontSize: 11, color: "#4a6b56", flexShrink: 0 },
  convLast: { fontSize: 13, color: "#4a6b56", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  convRole: { fontSize: 12, color: "#4a6b56" },

  chatPanel: { flex: 1, display: "flex", flexDirection: "column", height: "100vh" },
  noChatSelected: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 },
  noChatIcon: { fontSize: 56, opacity: 0.3 },
  noChatTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#e8f0eb" },
  noChatSub: { fontSize: 14, color: "#4a6b56", textAlign: "center", maxWidth: 320, lineHeight: 1.6 },

  chatHeader: { display: "flex", alignItems: "center", gap: 14, padding: "18px 24px", borderBottom: "1px solid rgba(29,158,117,0.12)", background: "rgba(8,12,9,0.95)", flexShrink: 0 },
  chatAvatar: { width: 44, height: 44, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, overflow: "hidden", flexShrink: 0 },
  chatName: { fontSize: 16, fontWeight: 600, color: "#e8f0eb", marginBottom: 2 },
  chatRole: { fontSize: 12, color: "#1D9E75" },

  msgList: { flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4 },
  noMsgs: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, margin: "auto" },
  wavingHand: { fontSize: 40 },
  noMsgsTxt: { fontSize: 14, color: "#4a6b56" },

  dateDivider: { display: "flex", justifyContent: "center", margin: "12px 0" },
  dateBadge: { fontSize: 11, color: "#4a6b56", background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.1)", borderRadius: 10, padding: "3px 12px" },

  msgRow: { display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 4, animation: "slideIn 0.2s both" },
  msgRowMine: { flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: "50%", background: "#1D9E7540", color: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 },
  msgBubble: { maxWidth: "68%", padding: "10px 14px", borderRadius: 16, position: "relative" },
  msgBubbleTheirs: { background: "rgba(15,25,18,0.9)", border: "1px solid rgba(29,158,117,0.15)", borderBottomLeftRadius: 4 },
  msgBubbleMine: { background: "#1D9E75", borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 1.5, color: "#e8f0eb", marginBottom: 4, wordBreak: "break-word" },
  msgTime: { fontSize: 10, color: "rgba(232,240,235,0.5)", display: "block", textAlign: "right" },

  inputRow: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid rgba(29,158,117,0.12)", background: "rgba(8,12,9,0.95)", flexShrink: 0 },
  msgInput: { flex: 1, background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  sendBtn: { width: 46, height: 46, borderRadius: "50%", background: "#1D9E75", border: "none", color: "#fff", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity 0.2s" },
}
