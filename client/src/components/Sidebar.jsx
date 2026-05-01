import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const navItems = [
  { icon: "⌂", label: "Feed", path: "/feed", key: "feed" },
  { icon: "💼", label: "Opportunities", path: "/opportunities", key: "opportunities" },
  { icon: "💬", label: "Messages", path: "/messages", key: "messages" },
  { icon: "⚙️", label: "Settings", path: "/settings", key: "settings" },
]

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const adminItems = user?.role === "admin"
    ? [{ icon: "🛡️", label: "Admin Panel", path: "/admin", key: "admin" }]
    : []

  const allItems = [...navItems, ...adminItems]

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logo} onClick={() => navigate("/feed")}>
        <span style={s.logoIcon}>⌂</span>
        <span style={s.logoText}>Homecoming</span>
      </div>

      {/* User info */}
      <div style={s.userCard} onClick={() => navigate(`/profile/${user?._id}`)}>
        <div style={s.userAvatar}>
          {user?.profilePic
            ? <img src={user.profilePic} alt="" style={s.avatarImg} />
            : <span>{user?.name?.[0]?.toUpperCase()}</span>}
        </div>
        <div>
          <div style={s.userName}>{user?.name}</div>
          <div style={s.userRole}>
            {user?.role === "alumni" ? "✦ Alumni" : user?.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {allItems.map(({ icon, label, path, key }) => (
          <button
            key={key}
            style={{ ...s.navItem, ...(active === key ? s.navItemActive : {}) }}
            onClick={() => navigate(path)}
          >
            <span style={s.navIcon}>{icon}</span>
            <span>{label}</span>
            {active === key && <div style={s.activeBar} />}
          </button>
        ))}
      </nav>

      <div style={s.spacer} />

      {/* Logout */}
      <button style={s.logoutBtn} onClick={handleLogout}>
        <span>↩</span> Sign Out
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </aside>
  )
}

const s = {
  sidebar: { width: 260, minHeight: "100vh", background: "rgba(8,12,9,0.95)", borderRight: "1px solid rgba(29,158,117,0.12)", display: "flex", flexDirection: "column", padding: "24px 16px", position: "sticky", top: 0, height: "100vh", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  logo: { display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 24px", cursor: "pointer" },
  logoIcon: { fontSize: 22, color: "#1D9E75" },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#e8f0eb" },

  userCard: { display: "flex", alignItems: "center", gap: 12, padding: "14px 12px", background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 12, marginBottom: 24, cursor: "pointer", transition: "background 0.2s" },
  userAvatar: { width: 40, height: 40, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  userName: { fontSize: 14, fontWeight: 600, color: "#e8f0eb", marginBottom: 2 },
  userRole: { fontSize: 12, color: "#1D9E75" },

  nav: { display: "flex", flexDirection: "column", gap: 2 },
  navItem: { display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "transparent", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", position: "relative", transition: "background 0.2s, color 0.2s" },
  navItemActive: { background: "rgba(29,158,117,0.12)", color: "#e8f0eb" },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  activeBar: { position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, background: "#1D9E75", borderRadius: "0 2px 2px 0" },

  spacer: { flex: 1 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "transparent", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, fontSize: 14, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" },
}
