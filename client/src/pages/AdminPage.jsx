import { useState, useEffect } from "react"
import * as api from "../api/index"
import Sidebar from "../components/Sidebar"

const TABS = ["complaints", "users", "requests"]

export default function AdminPage() {
  const [tab, setTab] = useState("complaints")
  const [complaints, setComplaints] = useState([])
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [c, u, r] = await Promise.all([
        api.getComplaints(),
        api.getConversations(), // reuse — actually call getAllUsers below
        api.getAdminRequests(),
      ])
      setComplaints(c.data)
      setRequests(r.data)
      // fetch all users separately
      const usersRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("hc_token")}` }
      })
      const usersData = await usersRes.json()
      setUsers(usersData)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleBlock = async (id) => {
    try { await api.blockUser(id); fetchAll() } catch (e) { console.error(e) }
  }

  const handleUnblock = async (id) => {
    try { await api.unblockUser(id); fetchAll() } catch (e) { console.error(e) }
  }

  const handleRequest = async (id, status) => {
    try { await api.handleAdminReq(id, status); fetchAll() } catch (e) { console.error(e) }
  }

  const filteredUsers = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const statCards = [
    { label: "Total Users", value: users.length, icon: "👥", color: "#1D9E75" },
    { label: "Complaints", value: complaints.filter(c => c.status === "pending").length, icon: "⚠️", color: "#f59e0b" },
    { label: "Pending Requests", value: requests.length, icon: "🕐", color: "#60a5fa" },
    { label: "Blocked Users", value: users.filter(u => u.isBlocked).length, icon: "🚫", color: "#f87171" },
  ]

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #1D9E75 !important; }
        input::placeholder { color: #4a6b56; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1D9E7530; border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Sidebar active="admin" />

      <main style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.headerIcon}>🛡️</span>
            <div>
              <h1 style={s.title}>Admin Command Center</h1>
              <p style={s.subtitle}>Manage users, complaints, and admin requests</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={s.statGrid}>
          {statCards.map((st, i) => (
            <div key={i} style={s.statCard}>
              <div style={s.statIcon}>{st.icon}</div>
              <div>
                <div style={{ ...s.statVal, color: st.color }}>{st.value}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          {TABS.map(t => (
            <button key={t} style={{ ...s.tabBtn, ...(tab === t ? s.tabBtnActive : {}) }} onClick={() => setTab(t)}>
              {t === "complaints" ? "⚠️ Complaints" : t === "users" ? "👥 Users" : "🕐 Admin Requests"}
              {t === "complaints" && complaints.filter(c => c.status === "pending").length > 0 && (
                <span style={s.badge}>{complaints.filter(c => c.status === "pending").length}</span>
              )}
              {t === "requests" && requests.length > 0 && (
                <span style={s.badge}>{requests.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.loadWrap}><div style={s.spinner} /></div>
        ) : (
          <>
            {/* COMPLAINTS TAB */}
            {tab === "complaints" && (
              <div style={s.section}>
                {complaints.length === 0 ? (
                  <div style={s.empty}><span style={s.emptyIcon}>✅</span><p style={s.emptyText}>No complaints filed.</p></div>
                ) : complaints.map((c, i) => (
                  <div key={c._id} style={{ ...s.card, animationDelay: `${i * 0.05}s` }}>
                    <div style={s.cardHeader}>
                      <div style={s.cardLeft}>
                        <div style={s.userAvatarSm}>{c.complainant?.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={s.cardName}>{c.complainant?.name} <span style={s.arrow}>→</span> <span style={s.accused}>{c.accusedUserId?.name}</span></div>
                          <div style={s.cardTime}>{new Date(c.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ ...s.statusBadge, ...(c.status === "reviewed" ? s.statusReviewed : s.statusPending) }}>
                        {c.status}
                      </div>
                    </div>
                    <p style={s.reason}>"{c.reason}"</p>
                    {c.screenshot && (
                      <div style={s.screenshotWrap}>
                        <span style={s.screenshotLabel}>📎 Evidence:</span>
                        <a href={c.screenshot} target="_blank" rel="noreferrer" style={s.screenshotLink}>View Screenshot →</a>
                      </div>
                    )}
                    <div style={s.cardActions}>
                      <button style={s.blockRedBtn} onClick={() => handleBlock(c.accusedUserId?._id)}>
                        🚫 Block {c.accusedUserId?.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* USERS TAB */}
            {tab === "users" && (
              <div style={s.section}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 Search users by name or email..."
                  style={s.searchInput} />
                <div style={s.usersTable}>
                  <div style={s.tableHeader}>
                    <span style={s.th}>User</span>
                    <span style={s.th}>Role</span>
                    <span style={s.th}>Email</span>
                    <span style={s.th}>Status</span>
                    <span style={s.th}>Action</span>
                  </div>
                  {filteredUsers.map((u, i) => (
                    <div key={u._id} style={{ ...s.tableRow, animationDelay: `${i * 0.03}s` }}>
                      <div style={s.userCell}>
                        <div style={s.userAvatarSm}>
                          {u.profilePic ? <img src={u.profilePic} alt="" style={s.avatarImg} /> : u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={s.userName}>{u.name}</span>
                      </div>
                      <span style={{ ...s.rolePill, ...(u.role === "alumni" ? s.rolePillAlumni : u.role === "admin" ? s.rolePillAdmin : {}) }}>
                        {u.role}
                      </span>
                      <span style={s.emailCell}>{u.email}</span>
                      <span style={{ ...s.statusPill, ...(u.isBlocked ? s.statusBlocked : s.statusActive) }}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                      <div style={s.actionCell}>
                        {u.role !== "admin" && (
                          u.isBlocked ? (
                            <button style={s.unblockBtn} onClick={() => handleUnblock(u._id)}>Unblock</button>
                          ) : (
                            <button style={s.blockBtn} onClick={() => handleBlock(u._id)}>Block</button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REQUESTS TAB */}
            {tab === "requests" && (
              <div style={s.section}>
                {requests.length === 0 ? (
                  <div style={s.empty}><span style={s.emptyIcon}>✅</span><p style={s.emptyText}>No pending admin requests.</p></div>
                ) : requests.map((r, i) => (
                  <div key={r._id} style={{ ...s.card, animationDelay: `${i * 0.05}s` }}>
                    <div style={s.cardHeader}>
                      <div style={s.cardLeft}>
                        <div style={s.userAvatarSm}>{r.name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={s.cardName}>{r.name}</div>
                          <div style={s.cardTime}>{r.email} · Requested {new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div style={{ ...s.statusBadge, ...s.statusPending }}>pending</div>
                    </div>
                    <div style={s.requestActions}>
                      <button style={s.approveBtn} onClick={() => handleRequest(r._id, "approved")}>✓ Approve</button>
                      <button style={s.rejectBtn} onClick={() => handleRequest(r._id, "rejected")}>✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, padding: "40px 48px", overflowY: "auto" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  headerIcon: { fontSize: 36 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#e8f0eb", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#7a9e88" },

  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
  statCard: { display: "flex", alignItems: "center", gap: 14, background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 14, padding: "18px 20px" },
  statIcon: { fontSize: 28 },
  statVal: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700 },
  statLabel: { fontSize: 12, color: "#4a6b56", marginTop: 2 },

  tabRow: { display: "flex", gap: 4, background: "rgba(15,25,18,0.5)", border: "1px solid rgba(29,158,117,0.1)", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" },
  tabBtn: { padding: "9px 20px", background: "transparent", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" },
  tabBtnActive: { background: "rgba(29,158,117,0.15)", color: "#e8f0eb" },
  badge: { background: "#f59e0b", color: "#000", borderRadius: "50%", minWidth: 18, height: 18, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" },

  loadWrap: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 32, height: 32, border: "2px solid rgba(29,158,117,0.2)", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  section: { display: "flex", flexDirection: "column", gap: 14 },
  empty: { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: 40, display: "block", marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#4a6b56" },

  card: { background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 14, padding: "20px 24px", animation: "fadeUp 0.3s both" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardLeft: { display: "flex", alignItems: "center", gap: 12 },
  userAvatarSm: { width: 36, height: 36, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, flexShrink: 0, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardName: { fontSize: 15, fontWeight: 600, color: "#e8f0eb" },
  cardTime: { fontSize: 12, color: "#4a6b56", marginTop: 2 },
  arrow: { color: "#f59e0b", fontSize: 12 },
  accused: { color: "#f87171" },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 10, letterSpacing: "0.04em", textTransform: "uppercase" },
  statusPending: { background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" },
  statusReviewed: { background: "rgba(29,158,117,0.12)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.25)" },
  reason: { fontSize: 14, color: "#9eb8a6", fontStyle: "italic", lineHeight: 1.6, marginBottom: 12 },
  screenshotWrap: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  screenshotLabel: { fontSize: 12, color: "#4a6b56" },
  screenshotLink: { fontSize: 13, color: "#1D9E75", textDecoration: "none", fontWeight: 500 },
  cardActions: { display: "flex", gap: 10 },
  blockRedBtn: { padding: "8px 16px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, fontSize: 13, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  requestActions: { display: "flex", gap: 10 },
  approveBtn: { padding: "9px 20px", background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 8, fontSize: 13, color: "#1D9E75", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
  rejectBtn: { padding: "9px 20px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  searchInput: { width: "100%", maxWidth: 400, background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.18)", borderRadius: 10, padding: "10px 16px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif", marginBottom: 16 },
  usersTable: { display: "flex", flexDirection: "column", gap: 0, border: "1px solid rgba(29,158,117,0.12)", borderRadius: 14, overflow: "hidden" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 2fr 1fr 1fr", gap: 12, padding: "12px 20px", background: "rgba(29,158,117,0.06)", borderBottom: "1px solid rgba(29,158,117,0.1)" },
  th: { fontSize: 11, fontWeight: 600, color: "#4a6b56", textTransform: "uppercase", letterSpacing: "0.06em" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1fr 2fr 1fr 1fr", gap: 12, padding: "14px 20px", alignItems: "center", borderBottom: "1px solid rgba(29,158,117,0.06)", animation: "fadeUp 0.3s both", background: "rgba(15,25,18,0.4)" },
  userCell: { display: "flex", alignItems: "center", gap: 10 },
  userName: { fontSize: 14, fontWeight: 500, color: "#e8f0eb" },
  emailCell: { fontSize: 13, color: "#7a9e88" },
  rolePill: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "1px solid rgba(148,163,184,0.2)", width: "fit-content" },
  rolePillAlumni: { background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" },
  rolePillAdmin: { background: "rgba(29,158,117,0.1)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.2)" },
  statusPill: { fontSize: 11, padding: "3px 10px", borderRadius: 10, width: "fit-content" },
  statusActive: { background: "rgba(29,158,117,0.1)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.2)" },
  statusBlocked: { background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.2)" },
  actionCell: { display: "flex" },
  blockBtn: { padding: "6px 12px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, fontSize: 12, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  unblockBtn: { padding: "6px 12px", background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 6, fontSize: 12, color: "#1D9E75", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
}
