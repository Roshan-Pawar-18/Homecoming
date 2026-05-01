import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"
import * as api from "../api/index"

export default function ConnectionCard({ user, onConnect }) {
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const [status, setStatus] = useState("idle") // idle | pending | connected | error
  const isMe = user._id === me?._id

  const handleConnect = async (e) => {
    e.stopPropagation()
    if (status !== "idle") return
    setStatus("pending")
    try {
      await api.sendConnect(user._id)
      setStatus("connected")
      onConnect?.()
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <div style={s.card} onClick={() => navigate(`/profile/${user._id}`)}>
      {/* Avatar */}
      <div style={s.avatar}>
        {user.profilePic
          ? <img src={user.profilePic} alt="" style={s.avatarImg} />
          : <span style={s.avatarLetter}>{user.name?.[0]?.toUpperCase()}</span>}
      </div>

      {/* Badge */}
      {user.role === "alumni" && <div style={s.amberBadge}>✦</div>}
      {user.role === "admin" && <div style={s.adminBadge}>🛡️</div>}

      {/* Info */}
      <div style={s.info}>
        <div style={s.name}>{user.name}</div>
        <div style={s.role}>
          {user.role === "alumni" ? "✦ Alumni" : user.role === "admin" ? "Admin" : "Student"}
        </div>
        {user.bio && <div style={s.bio}>{user.bio.length > 60 ? user.bio.slice(0, 60) + "..." : user.bio}</div>}
      </div>

      {/* Skills */}
      {user.skills?.length > 0 && (
        <div style={s.skills}>
          {user.skills.slice(0, 3).map((sk, i) => (
            <span key={i} style={s.skill}>{sk}</span>
          ))}
          {user.skills.length > 3 && <span style={s.moreSkills}>+{user.skills.length - 3}</span>}
        </div>
      )}

      {/* Action */}
      {!isMe && (
        <button
          style={{
            ...s.connectBtn,
            ...(status === "connected" ? s.connectedBtn : {}),
            ...(status === "error" ? s.errorBtn : {}),
          }}
          onClick={handleConnect}
          disabled={status !== "idle"}
        >
          {status === "idle" && "+ Connect"}
          {status === "pending" && "Sending..."}
          {status === "connected" && "✓ Sent"}
          {status === "error" && "Try again"}
        </button>
      )}
    </div>
  )
}

const s = {
  card: {
    position: "relative",
    background: "rgba(15,25,18,0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(29,158,117,0.15)",
    borderRadius: 16,
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    transition: "border-color 0.2s, transform 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: "50%",
    background: "#1D9E75",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "2px solid rgba(29,158,117,0.3)",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarLetter: { fontSize: 24, fontWeight: 700, color: "#fff" },

  amberBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "rgba(245,158,11,0.15)",
    color: "#f59e0b",
    border: "1px solid rgba(245,158,11,0.3)",
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
  },
  adminBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    fontSize: 14,
  },

  info: { textAlign: "center" },
  name: { fontSize: 15, fontWeight: 600, color: "#e8f0eb", marginBottom: 3 },
  role: { fontSize: 12, color: "#1D9E75", fontWeight: 500, marginBottom: 6 },
  bio: { fontSize: 12, color: "#7a9e88", lineHeight: 1.5 },

  skills: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  skill: {
    fontSize: 11,
    padding: "3px 10px",
    background: "rgba(29,158,117,0.08)",
    border: "1px solid rgba(29,158,117,0.2)",
    borderRadius: 10,
    color: "#9eb8a6",
  },
  moreSkills: { fontSize: 11, color: "#4a6b56" },

  connectBtn: {
    marginTop: 4,
    width: "100%",
    padding: "9px",
    background: "rgba(29,158,117,0.12)",
    border: "1px solid rgba(29,158,117,0.3)",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "#1D9E75",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  connectedBtn: {
    background: "rgba(29,158,117,0.2)",
    color: "#34d399",
    cursor: "default",
  },
  errorBtn: {
    background: "rgba(220,38,38,0.1)",
    border: "1px solid rgba(220,38,38,0.2)",
    color: "#f87171",
  },
}
