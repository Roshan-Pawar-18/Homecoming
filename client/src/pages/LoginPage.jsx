import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import * as api from "../api/index"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState("login") // "login" | "signup"
  const [role, setRole] = useState("student")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "signup") {
        const { data } = await api.signup({ ...form, role })
        if (role === "admin") {
          setError("✓ Admin request submitted. Await approval.")
          setLoading(false)
          return
        }
        login(data.user, data.token)
      } else {
        const { data } = await api.login({ ...form, role })
        login(data.user, data.token)
      }
      navigate(role === "admin" ? "/admin" : "/feed")
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div style={s.root}>
      <div style={s.orb1} /><div style={s.orb2} />

      {/* Left panel */}
      <div style={s.leftPanel}>
        <div style={s.logoWrap} onClick={() => navigate("/")} >
          <span style={s.logoIcon}>⌂</span>
          <span style={s.logoText}>Homecoming</span>
        </div>
        <div style={s.leftContent}>
          <h2 style={s.leftTitle}>Your alumni<br />network awaits.</h2>
          <p style={s.leftSub}>Join thousands of students and alumni building real connections at Medicaps University.</p>
          <div style={s.testimonial}>
            <div style={s.testimonialText}>"Homecoming helped me land my first internship through an alumni connection. Game changer."</div>
            <div style={s.testimonialAuthor}>— Priya Sharma, B.Tech CSE 2024</div>
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div style={s.rightPanel}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardIcon}>⌂</span>
            <h1 style={s.cardTitle}>{mode === "login" ? "Welcome Back" : "Join Homecoming"}</h1>
            <p style={s.cardSub}>{mode === "login" ? "Sign in to your account" : "Create your account today"}</p>
          </div>

          {/* Role tabs */}
          <div style={s.roleTabs}>
            {["student", "alumni", "admin"].map((r) => (
              <button key={r} onClick={() => setRole(r)}
                style={{ ...s.roleTab, ...(role === r ? s.roleTabActive : {}) }}>
                {r === "student" ? "🎓" : r === "alumni" ? "💼" : "🛡️"} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            {mode === "signup" && (
              <div style={s.fieldWrap}>
                <label style={s.label}>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Abhay Singh Parihar" required style={s.input} />
              </div>
            )}
            <div style={s.fieldWrap}>
              <label style={s.label}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@medicaps.ac.in" required style={s.input} />
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required style={s.input} />
            </div>

            {error && (
              <div style={{ ...s.errorBox, ...(error.startsWith("✓") ? s.successBox : {}) }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={s.submitBtn}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={s.switchWrap}>
            <span style={s.switchText}>
              {mode === "login" ? "New to Homecoming? " : "Already have an account? "}
            </span>
            <button style={s.switchBtn} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError("") }}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </div>

          {mode === "login" && role === "admin" && (
            <p style={s.adminHint}>Default admin: admin@gmail.com / admin123</p>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #4a6b56; }
        input:focus { outline: none; border-color: #1D9E75 !important; box-shadow: 0 0 0 3px rgba(29,158,117,0.15); }
        @keyframes orbPulse { 0%,100%{opacity:0.2} 50%{opacity:0.35} }
      `}</style>
    </div>
  )
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" },
  orb1: { position: "fixed", top: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #1D9E7530 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 6s ease-in-out infinite" },
  orb2: { position: "fixed", bottom: "-10%", right: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #f59e0b18 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 8s ease-in-out infinite 2s" },

  leftPanel: { flex: 1, display: "flex", flexDirection: "column", padding: "40px 60px", background: "rgba(15,25,18,0.5)", borderRight: "1px solid rgba(29,158,117,0.12)", position: "relative" },
  logoWrap: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: "auto" },
  logoIcon: { fontSize: 22, color: "#1D9E75" },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8f0eb" },
  leftContent: { marginBottom: 60 },
  leftTitle: { fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "#e8f0eb", lineHeight: 1.15, marginBottom: 20 },
  leftSub: { fontSize: 16, color: "#7a9e88", lineHeight: 1.7, maxWidth: 380, marginBottom: 40 },
  testimonial: { background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.18)", borderRadius: 14, padding: "24px 28px" },
  testimonialText: { fontSize: 15, color: "#b8d4c4", lineHeight: 1.7, fontStyle: "italic", marginBottom: 14 },
  testimonialAuthor: { fontSize: 13, color: "#1D9E75", fontWeight: 600 },

  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px" },
  card: { width: "100%", maxWidth: 420, background: "rgba(15,25,18,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(29,158,117,0.18)", borderRadius: 20, padding: "40px 36px" },
  cardHeader: { textAlign: "center", marginBottom: 28 },
  cardIcon: { fontSize: 28, color: "#1D9E75", display: "block", marginBottom: 12 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#e8f0eb", marginBottom: 6 },
  cardSub: { fontSize: 14, color: "#7a9e88" },

  roleTabs: { display: "flex", background: "rgba(8,15,10,0.6)", borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 },
  roleTab: { flex: 1, padding: "8px 4px", background: "transparent", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s" },
  roleTabActive: { background: "#1D9E75", color: "#fff" },

  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "#9eb8a6" },
  input: { background: "rgba(8,15,10,0.6)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s" },
  errorBox: { background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171" },
  successBox: { background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.25)", color: "#34d399" },
  submitBtn: { marginTop: 4, padding: "14px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s" },

  switchWrap: { display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 20 },
  switchText: { fontSize: 13, color: "#7a9e88" },
  switchBtn: { fontSize: 13, fontWeight: 600, color: "#1D9E75", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  adminHint: { textAlign: "center", fontSize: 11, color: "#4a6b56", marginTop: 12 },
}
