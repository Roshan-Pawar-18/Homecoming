import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import * as api from "../api/index"
import Sidebar from "../components/Sidebar"

export default function OpportunitiesPage() {
  const { user } = useAuth()
  const [opps, setOpps] = useState([])
  const [filter, setFilter] = useState("all") // all | job | internship
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", company: "", description: "", link: "", type: "job" })
  const [posting, setPosting] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchOpps() }, [])

  const fetchOpps = async () => {
    try {
      const { data } = await api.getOpportunities()
      setOpps(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handlePost = async () => {
    if (!form.title || !form.company) return
    setPosting(true)
    try {
      await api.createOpportunity(form)
      setShowForm(false)
      setForm({ title: "", company: "", description: "", link: "", type: "job" })
      fetchOpps()
    } catch (e) { console.error(e) }
    setPosting(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteOpportunity(id)
      setOpps(opps.filter(o => o._id !== id))
    } catch (e) { console.error(e) }
  }

  const filtered = opps.filter(o => {
    const matchType = filter === "all" || o.type === filter
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const daysLeft = (date) => {
    const posted = new Date(date)
    const expires = new Date(posted.getTime() + 30 * 24 * 60 * 60 * 1000)
    const left = Math.max(0, Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24)))
    return left
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #1D9E75 !important; }
        input::placeholder, textarea::placeholder { color: #4a6b56; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1D9E7530; border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Sidebar active="opportunities" />

      <main style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Opportunities</h1>
            <p style={s.subtitle}>Explore jobs and internships curated by our Alumni.</p>
          </div>
          {user?.role === "alumni" && (
            <button style={s.postBtn} onClick={() => setShowForm(true)}>
              + Post Opportunity
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <div style={s.searchWrap}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by title or company..."
              style={s.searchInput}
            />
          </div>
          <div style={s.tabs}>
            {["all", "job", "internship"].map(t => (
              <button key={t} style={{ ...s.tab, ...(filter === t ? s.tabActive : {}) }} onClick={() => setFilter(t)}>
                {t === "all" ? "All" : t === "job" ? "💼 Jobs" : "🎯 Internships"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={s.statsBar}>
          <div style={s.statChip}>
            <span style={s.statNum}>{opps.filter(o => o.type === "job").length}</span>
            <span style={s.statLbl}>Jobs</span>
          </div>
          <div style={s.statChip}>
            <span style={s.statNum}>{opps.filter(o => o.type === "internship").length}</span>
            <span style={s.statLbl}>Internships</span>
          </div>
          <div style={s.statChip}>
            <span style={s.statNum}>{filtered.length}</span>
            <span style={s.statLbl}>Showing</span>
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div style={s.loadWrap}><div style={s.spinner} /></div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🔍</div>
            <p style={s.emptyText}>No opportunities found. {user?.role === "alumni" ? "Be the first to post!" : "Check back soon!"}</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((opp, i) => {
              const left = daysLeft(opp.createdAt)
              const isOwner = opp.postedBy?._id === user?._id || user?.role === "admin"
              return (
                <div key={opp._id} style={{ ...s.card, animationDelay: `${i * 0.06}s` }}>
                  <div style={s.cardTop}>
                    <div style={{ ...s.typeBadge, ...(opp.type === "internship" ? s.typeBadgeIntern : {}) }}>
                      {opp.type === "job" ? "💼 Job" : "🎯 Internship"}
                    </div>
                    <div style={{ ...s.approvedBadge }}>APPROVED</div>
                  </div>

                  <h3 style={s.cardTitle}>{opp.title}</h3>
                  <div style={s.companyRow}>
                    <span style={s.company}>{opp.company}</span>
                    <span style={s.dot}>·</span>
                    <span style={s.location}>On-Site</span>
                  </div>

                  {opp.description && (
                    <p style={s.cardDesc}>{opp.description.length > 100 ? opp.description.slice(0, 100) + "..." : opp.description}</p>
                  )}

                  <div style={s.cardMeta}>
                    <span style={{ ...s.metaChip, color: left <= 3 ? "#f87171" : "#7a9e88" }}>
                      ⏱ {left === 0 ? "Expired" : `${left} days left`}
                    </span>
                    <div style={s.posterInfo}>
                      <div style={s.posterAvatar}>{opp.postedBy?.name?.[0]?.toUpperCase()}</div>
                      <span style={s.posterName}>{opp.postedBy?.name}</span>
                    </div>
                  </div>

                  <div style={s.cardActions}>
                    {opp.link && (
                      <a href={opp.link} target="_blank" rel="noreferrer" style={s.applyBtn}>
                        Apply Now →
                      </a>
                    )}
                    {isOwner && (
                      <button style={s.deleteBtn} onClick={() => handleDelete(opp._id)}>🗑</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Post form modal */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Post an Opportunity</h2>
              <button style={s.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div style={s.formFields}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Job Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Frontend Developer" style={s.input} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Company *</label>
                <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Infosys" style={s.input} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Type</label>
                <div style={s.typeTabs}>
                  {["job", "internship"].map(t => (
                    <button key={t} onClick={() => setForm({ ...form, type: t })}
                      style={{ ...s.typeTab, ...(form.type === t ? s.typeTabActive : {}) }}>
                      {t === "job" ? "💼 Job" : "🎯 Internship"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the role, requirements, and perks..." rows={4}
                  style={{ ...s.input, resize: "none" }} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Apply Link</label>
                <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..." style={s.input} />
              </div>
            </div>

            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button style={{ ...s.submitBtn, opacity: posting ? 0.7 : 1 }} onClick={handlePost} disabled={posting}>
                {posting ? "Posting..." : "Post Opportunity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, padding: "40px 48px", overflowY: "auto" },

  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: "#e8f0eb", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#7a9e88" },
  postBtn: { padding: "11px 22px", background: "#1D9E75", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },

  filterRow: { display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  searchWrap: { flex: 1, minWidth: 220 },
  searchInput: { width: "100%", background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.18)", borderRadius: 10, padding: "11px 16px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  tabs: { display: "flex", background: "rgba(15,25,18,0.6)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 10, padding: 4, gap: 4 },
  tab: { padding: "8px 16px", background: "transparent", border: "none", borderRadius: 8, fontSize: 13, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.2s" },
  tabActive: { background: "#1D9E75", color: "#fff" },

  statsBar: { display: "flex", gap: 12, marginBottom: 28 },
  statChip: { display: "flex", gap: 6, alignItems: "center", background: "rgba(15,25,18,0.6)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 8, padding: "6px 14px" },
  statNum: { fontSize: 16, fontWeight: 700, color: "#1D9E75", fontFamily: "'Playfair Display', serif" },
  statLbl: { fontSize: 12, color: "#4a6b56" },

  loadWrap: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 32, height: 32, border: "2px solid rgba(29,158,117,0.2)", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty: { textAlign: "center", padding: "80px 0" },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: "#4a6b56" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 },
  card: { background: "rgba(15,25,18,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 16, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.4s both", transition: "border-color 0.2s, transform 0.2s" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 10, background: "rgba(29,158,117,0.12)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.25)" },
  typeBadgeIntern: { background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" },
  approvedBadge: { fontSize: 10, fontWeight: 600, color: "#1D9E75", letterSpacing: "0.06em", opacity: 0.7 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#e8f0eb" },
  companyRow: { display: "flex", alignItems: "center", gap: 6 },
  company: { fontSize: 14, color: "#9eb8a6", fontWeight: 500 },
  dot: { color: "#4a6b56" },
  location: { fontSize: 13, color: "#4a6b56" },
  cardDesc: { fontSize: 13, color: "#7a9e88", lineHeight: 1.6 },
  cardMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  metaChip: { fontSize: 12, fontWeight: 500 },
  posterInfo: { display: "flex", alignItems: "center", gap: 6 },
  posterAvatar: { width: 22, height: 22, borderRadius: "50%", background: "#1D9E7550", color: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 },
  posterName: { fontSize: 12, color: "#4a6b56" },
  cardActions: { display: "flex", gap: 10, alignItems: "center", marginTop: 4 },
  applyBtn: { flex: 1, display: "block", padding: "10px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  deleteBtn: { padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 14 },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  modal: { background: "#0d1a10", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#e8f0eb" },
  closeBtn: { background: "none", border: "none", color: "#7a9e88", fontSize: 18, cursor: "pointer", padding: 4 },
  formFields: { display: "flex", flexDirection: "column", gap: 18, marginBottom: 24 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#7a9e88", fontWeight: 500 },
  input: { background: "rgba(8,15,10,0.6)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif", width: "100%" },
  typeTabs: { display: "flex", gap: 8 },
  typeTab: { flex: 1, padding: "9px", background: "rgba(8,15,10,0.5)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 8, fontSize: 13, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  typeTabActive: { background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.4)", color: "#1D9E75", fontWeight: 600 },
  modalBtns: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(232,240,235,0.15)", borderRadius: 8, color: "#e8f0eb", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  submitBtn: { padding: "10px 24px", background: "#1D9E75", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14 },
}
