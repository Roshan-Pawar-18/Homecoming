import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import * as api from "../api/index"
import Sidebar from "../components/Sidebar"

export default function ProfilePage() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [skillInput, setSkillInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const isMe = id === me?._id

  useEffect(() => { fetchProfile() }, [id])

  const fetchProfile = async () => {
    try {
      const { data } = isMe ? await api.getMe() : await api.getUser(id)
      setProfile(data)
      setForm({ name: data.name, bio: data.bio || "", skills: data.skills || [], education: data.education || [], experience: data.experience || [] })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, typeof v === "object" ? JSON.stringify(v) : v))
      await api.updateProfile(fd)
      setEditing(false)
      fetchProfile()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const handleConnect = async () => {
    setConnecting(true)
    try { await api.sendConnect(id) } catch (e) { console.error(e) }
    setConnecting(false)
    fetchProfile()
  }

  const addSkill = () => {
    if (!skillInput.trim()) return
    setForm({ ...form, skills: [...(form.skills || []), skillInput.trim()] })
    setSkillInput("")
  }

  const removeSkill = (i) => setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) })

  const isConnected = profile?.connections?.includes(me?._id)

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080f0a" }}>
      <Sidebar active="" />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={s.spinner} />
      </div>
    </div>
  )

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus { outline: none; border-color: #1D9E75 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <Sidebar active="profile" />

      <main style={s.main}>
        {/* Banner */}
        <div style={s.banner}>
          <div style={s.bannerGradient} />
          <div style={s.profileRow}>
            <div style={s.profileAvatar}>
              {profile?.profilePic
                ? <img src={profile.profilePic} alt="" style={s.avatarImg} />
                : <span style={s.avatarLetter}>{profile?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div style={s.profileInfo}>
              <h1 style={s.profileName}>
                {profile?.name}
                {profile?.role === "alumni" && <span style={s.amberBadge}>✦ Alumni</span>}
                {profile?.role === "admin" && <span style={s.adminBadge}>Admin</span>}
              </h1>
              <p style={s.profileBio}>{profile?.bio || "No bio yet."}</p>
              <div style={s.profileMeta}>
                <span style={s.metaItem}>🎓 {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}</span>
                <span style={s.metaItem}>🔗 {profile?.connections?.length || 0} connections</span>
              </div>
            </div>
            <div style={s.profileActions}>
              {isMe ? (
                <button style={s.editBtn} onClick={() => setEditing(true)}>✏️ Edit Profile</button>
              ) : (
                <>
                  <button style={s.connectBtn} onClick={handleConnect} disabled={connecting || isConnected}>
                    {isConnected ? "✓ Connected" : connecting ? "Sending..." : "+ Connect"}
                  </button>
                  <button style={s.msgBtn} onClick={() => navigate("/messages")}>💬 Message</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={s.content}>
          {/* Skills */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Skills</h2>
            <div style={s.skillsWrap}>
              {(editing ? form.skills : profile?.skills || []).map((sk, i) => (
                <div key={i} style={s.skillTag}>
                  {sk}
                  {editing && <button style={s.removeSkill} onClick={() => removeSkill(i)}>✕</button>}
                </div>
              ))}
              {editing && (
                <div style={s.skillInput}>
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSkill()}
                    placeholder="Add skill..." style={s.miniInput} />
                  <button style={s.addBtn} onClick={addSkill}>+</button>
                </div>
              )}
              {!editing && profile?.skills?.length === 0 && <p style={s.emptyTxt}>No skills added yet.</p>}
            </div>
          </div>

          {/* Experience */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Experience</h2>
            {(editing ? form.experience : profile?.experience || []).map((exp, i) => (
              <div key={i} style={s.expItem}>
                <div style={s.expDot} />
                <div>
                  <div style={s.expRole}>{exp.role}</div>
                  <div style={s.expComp}>{exp.company} · {exp.duration}</div>
                </div>
              </div>
            ))}
            {editing && (
              <button style={s.addSectionBtn} onClick={() =>
                setForm({ ...form, experience: [...form.experience, { role: "", company: "", duration: "" }] })}>
                + Add Experience
              </button>
            )}
            {!editing && profile?.experience?.length === 0 && <p style={s.emptyTxt}>No experience added yet.</p>}
          </div>

          {/* Education */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Education</h2>
            {(editing ? form.education : profile?.education || []).map((edu, i) => (
              <div key={i} style={s.expItem}>
                <div style={{ ...s.expDot, background: "#f59e0b" }} />
                <div>
                  <div style={s.expRole}>{edu.degree}</div>
                  <div style={s.expComp}>{edu.school} · {edu.year}</div>
                </div>
              </div>
            ))}
            {editing && (
              <button style={s.addSectionBtn} onClick={() =>
                setForm({ ...form, education: [...form.education, { school: "", degree: "", year: "" }] })}>
                + Add Education
              </button>
            )}
            {!editing && profile?.education?.length === 0 && <p style={s.emptyTxt}>No education added yet.</p>}
          </div>
        </div>

        {/* Edit modal */}
        {editing && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h2 style={s.modalTitle}>Edit Profile</h2>
              <div style={s.modalFields}>
                <label style={s.label}>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={s.input} />
                <label style={s.label}>Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3} style={{ ...s.input, resize: "none" }} />
              </div>
              <div style={s.modalBtns}>
                <button style={s.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, overflowY: "auto" },
  spinner: { width: 36, height: 36, border: "3px solid rgba(29,158,117,0.2)", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  banner: { position: "relative", height: 180, background: "linear-gradient(135deg, rgba(29,158,117,0.3) 0%, rgba(245,158,11,0.1) 100%)", borderBottom: "1px solid rgba(29,158,117,0.15)" },
  bannerGradient: { position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(29,158,117,0.2) 0%, transparent 60%)" },
  profileRow: { position: "absolute", bottom: -32, left: 40, right: 40, display: "flex", alignItems: "flex-end", gap: 20 },
  profileAvatar: { width: 90, height: 90, borderRadius: "50%", background: "#1D9E75", border: "3px solid #080f0a", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarLetter: { fontSize: 32, fontWeight: 700, color: "#fff" },
  profileInfo: { flex: 1, paddingBottom: 4 },
  profileName: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#e8f0eb", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  amberBadge: { fontSize: 11, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "2px 8px" },
  adminBadge: { fontSize: 11, background: "rgba(29,158,117,0.15)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 10, padding: "2px 8px" },
  profileBio: { fontSize: 14, color: "#7a9e88", marginBottom: 6 },
  profileMeta: { display: "flex", gap: 16 },
  metaItem: { fontSize: 13, color: "#4a6b56" },
  profileActions: { display: "flex", gap: 10, paddingBottom: 4, flexShrink: 0 },

  content: { padding: "60px 40px 40px", display: "flex", flexDirection: "column", gap: 20 },
  card: { background: "rgba(15,25,18,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 16, padding: "24px 28px", animation: "fadeUp 0.4s both" },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#e8f0eb", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(29,158,117,0.1)" },

  skillsWrap: { display: "flex", flexWrap: "wrap", gap: 10 },
  skillTag: { display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.25)", borderRadius: 20, fontSize: 13, color: "#1D9E75", fontWeight: 500 },
  removeSkill: { background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11, padding: 0 },
  skillInput: { display: "flex", gap: 6 },
  miniInput: { background: "rgba(8,15,10,0.5)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 8, padding: "5px 10px", fontSize: 13, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  addBtn: { padding: "5px 12px", background: "#1D9E75", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600 },
  emptyTxt: { fontSize: 14, color: "#4a6b56" },

  expItem: { display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 },
  expDot: { width: 10, height: 10, borderRadius: "50%", background: "#1D9E75", marginTop: 5, flexShrink: 0 },
  expRole: { fontSize: 15, fontWeight: 600, color: "#e8f0eb", marginBottom: 3 },
  expComp: { fontSize: 13, color: "#7a9e88" },
  addSectionBtn: { padding: "8px 16px", background: "transparent", border: "1px dashed rgba(29,158,117,0.3)", borderRadius: 8, fontSize: 13, color: "#1D9E75", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 8 },

  editBtn: { padding: "9px 18px", background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 8, fontSize: 13, color: "#1D9E75", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
  connectBtn: { padding: "9px 18px", background: "#1D9E75", border: "none", borderRadius: 8, fontSize: 13, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
  msgBtn: { padding: "9px 18px", background: "transparent", border: "1px solid rgba(232,240,235,0.15)", borderRadius: 8, fontSize: 13, color: "#e8f0eb", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 },
  modal: { background: "#0d1a10", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 20, padding: "36px", width: "100%", maxWidth: 480 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#e8f0eb", marginBottom: 24 },
  modalFields: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 },
  label: { fontSize: 13, color: "#7a9e88", fontWeight: 500, marginBottom: 4, display: "block" },
  input: { background: "rgba(8,15,10,0.6)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif", width: "100%" },
  modalBtns: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: { padding: "10px 20px", background: "transparent", border: "1px solid rgba(232,240,235,0.15)", borderRadius: 8, color: "#e8f0eb", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  saveBtn: { padding: "10px 20px", background: "#1D9E75", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
}
