import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("account")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleLogout = () => { logout(); navigate("/") }

  const tabs = [
    { key: "account", icon: "👤", label: "Account" },
    { key: "privacy", icon: "🔒", label: "Privacy" },
    { key: "notifications", icon: "🔔", label: "Notifications" },
    { key: "appearance", icon: "🎨", label: "Appearance" },
    { key: "danger", icon: "⚠️", label: "Danger Zone" },
  ]

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #1D9E75 !important; }
        input::placeholder { color: #4a6b56; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      <Sidebar active="settings" />

      <main style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>Settings</h1>
          <p style={s.subtitle}>Manage your account preferences</p>
        </div>

        <div style={s.layout}>
          {/* Settings nav */}
          <div style={s.settingsNav}>
            {tabs.map(t => (
              <button key={t.key}
                style={{ ...s.settingsNavItem, ...(activeTab === t.key ? s.settingsNavActive : {}), ...(t.key === "danger" ? s.dangerNavItem : {}) }}
                onClick={() => setActiveTab(t.key)}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {activeTab === t.key && <div style={s.activeIndicator} />}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div style={s.panel}>
            {/* Account */}
            {activeTab === "account" && (
              <div style={s.panelContent}>
                <h2 style={s.panelTitle}>Account Settings</h2>

                <div style={s.infoCard}>
                  <div style={s.userPreview}>
                    <div style={s.bigAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={s.previewName}>{user?.name}</div>
                      <div style={s.previewRole}>{user?.role} · {user?.email}</div>
                    </div>
                  </div>
                </div>

                <div style={s.settingsGroup}>
                  <div style={s.settingsRow}>
                    <div style={s.settingsLabel}>
                      <span style={s.settingsLabelTitle}>Edit Profile</span>
                      <span style={s.settingsLabelSub}>Update your name, bio, skills and photo</span>
                    </div>
                    <button style={s.actionBtn} onClick={() => navigate(`/profile/${user?._id}`)}>
                      Go to Profile →
                    </button>
                  </div>

                  <div style={s.divider} />

                  <div style={s.settingsRow}>
                    <div style={s.settingsLabel}>
                      <span style={s.settingsLabelTitle}>Change Password</span>
                      <span style={s.settingsLabelSub}>Update your account password</span>
                    </div>
                    <button style={s.actionBtn} onClick={handleSave}>Update</button>
                  </div>

                  <div style={s.divider} />

                  <div style={s.settingsRow}>
                    <div style={s.settingsLabel}>
                      <span style={s.settingsLabelTitle}>Account Role</span>
                      <span style={s.settingsLabelSub}>Your current role on the platform</span>
                    </div>
                    <span style={s.roleBadge}>{user?.role}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeTab === "privacy" && (
              <div style={s.panelContent}>
                <h2 style={s.panelTitle}>Privacy Settings</h2>
                <div style={s.settingsGroup}>
                  {[
                    { label: "Profile Visibility", sub: "Allow others to find and view your profile", defaultOn: true },
                    { label: "Show in Search", sub: "Appear in user search results", defaultOn: true },
                    { label: "Connection Requests", sub: "Allow others to send you connection requests", defaultOn: true },
                    { label: "Show Email", sub: "Display your email on your public profile", defaultOn: false },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={s.settingsRow}>
                        <div style={s.settingsLabel}>
                          <span style={s.settingsLabelTitle}>{item.label}</span>
                          <span style={s.settingsLabelSub}>{item.sub}</span>
                        </div>
                        <Toggle defaultOn={item.defaultOn} />
                      </div>
                      {i < 3 && <div style={s.divider} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div style={s.panelContent}>
                <h2 style={s.panelTitle}>Notification Preferences</h2>
                <div style={s.settingsGroup}>
                  {[
                    { label: "New Connection Request", sub: "When someone sends you a connection request", defaultOn: true },
                    { label: "New Message", sub: "When you receive a direct message", defaultOn: true },
                    { label: "Post Likes", sub: "When someone likes your post", defaultOn: false },
                    { label: "Comments", sub: "When someone comments on your post", defaultOn: true },
                    { label: "New Opportunities", sub: "When alumni post new jobs or internships", defaultOn: true },
                  ].map((item, i, arr) => (
                    <div key={i}>
                      <div style={s.settingsRow}>
                        <div style={s.settingsLabel}>
                          <span style={s.settingsLabelTitle}>{item.label}</span>
                          <span style={s.settingsLabelSub}>{item.sub}</span>
                        </div>
                        <Toggle defaultOn={item.defaultOn} />
                      </div>
                      {i < arr.length - 1 && <div style={s.divider} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <div style={s.panelContent}>
                <h2 style={s.panelTitle}>Appearance</h2>
                <div style={s.settingsGroup}>
                  <div style={s.settingsRow}>
                    <div style={s.settingsLabel}>
                      <span style={s.settingsLabelTitle}>Theme</span>
                      <span style={s.settingsLabelSub}>Choose your preferred color theme</span>
                    </div>
                    <div style={s.themeOptions}>
                      <div style={{ ...s.themeOption, ...s.themeOptionActive }}>🌑 Dark</div>
                      <div style={s.themeOption}>☀️ Light</div>
                    </div>
                  </div>
                  <div style={s.divider} />
                  <div style={s.settingsRow}>
                    <div style={s.settingsLabel}>
                      <span style={s.settingsLabelTitle}>Accent Color</span>
                      <span style={s.settingsLabelSub}>Current: Emerald Green</span>
                    </div>
                    <div style={s.colorDots}>
                      {["#1D9E75", "#60a5fa", "#f59e0b", "#a78bfa", "#f87171"].map(c => (
                        <div key={c} style={{ ...s.colorDot, background: c, ...(c === "#1D9E75" ? s.colorDotActive : {}) }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === "danger" && (
              <div style={s.panelContent}>
                <h2 style={{ ...s.panelTitle, color: "#f87171" }}>⚠️ Danger Zone</h2>
                <p style={s.dangerDesc}>These actions are irreversible. Please proceed with caution.</p>
                <div style={s.dangerGroup}>
                  <div style={s.dangerRow}>
                    <div style={s.settingsLabel}>
                      <span style={s.settingsLabelTitle}>Sign Out</span>
                      <span style={s.settingsLabelSub}>Sign out of your account on this device</span>
                    </div>
                    <button style={s.logoutBtn} onClick={handleLogout}>Sign Out</button>
                  </div>
                  <div style={s.divider} />
                  <div style={s.dangerRow}>
                    <div style={s.settingsLabel}>
                      <span style={{ ...s.settingsLabelTitle, color: "#f87171" }}>Delete Account</span>
                      <span style={s.settingsLabelSub}>Permanently delete your account and all data</span>
                    </div>
                    <button style={s.deleteBtn}>Delete Account</button>
                  </div>
                </div>
              </div>
            )}

            {/* Save bar */}
            {activeTab !== "danger" && (
              <div style={s.saveBar}>
                {saved && <span style={s.savedMsg}>✓ Settings saved</span>}
                <button style={s.saveBtn} onClick={handleSave}>Save Changes</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Toggle({ defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{ ...tog.wrap, ...(on ? tog.wrapOn : {}) }} onClick={() => setOn(!on)}>
      <div style={{ ...tog.knob, ...(on ? tog.knobOn : {}) }} />
    </div>
  )
}

const tog = {
  wrap: { width: 44, height: 24, borderRadius: 12, background: "rgba(29,158,117,0.2)", border: "1px solid rgba(29,158,117,0.2)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 },
  wrapOn: { background: "#1D9E75", border: "1px solid #1D9E75" },
  knob: { position: "absolute", top: 2, left: 2, width: 18, height: 18, borderRadius: "50%", background: "#4a6b56", transition: "transform 0.2s, background 0.2s" },
  knobOn: { transform: "translateX(20px)", background: "#fff" },
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, padding: "40px 48px", overflowY: "auto" },
  header: { marginBottom: 32 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#e8f0eb", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#7a9e88" },

  layout: { display: "flex", gap: 28, alignItems: "flex-start" },
  settingsNav: { width: 200, display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 },
  settingsNavItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "transparent", border: "none", borderRadius: 10, fontSize: 14, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", position: "relative", transition: "all 0.2s" },
  settingsNavActive: { background: "rgba(29,158,117,0.1)", color: "#e8f0eb" },
  dangerNavItem: { color: "#f87171" },
  activeIndicator: { position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, background: "#1D9E75", borderRadius: "0 2px 2px 0" },

  panel: { flex: 1, background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 16, overflow: "hidden", animation: "slideIn 0.25s both" },
  panelContent: { padding: "28px 32px" },
  panelTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#e8f0eb", marginBottom: 24 },

  infoCard: { background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 },
  userPreview: { display: "flex", alignItems: "center", gap: 14 },
  bigAvatar: { width: 52, height: 52, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 },
  previewName: { fontSize: 16, fontWeight: 600, color: "#e8f0eb", marginBottom: 3 },
  previewRole: { fontSize: 13, color: "#7a9e88" },

  settingsGroup: { background: "rgba(8,15,10,0.4)", border: "1px solid rgba(29,158,117,0.1)", borderRadius: 12, overflow: "hidden" },
  settingsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", gap: 16 },
  settingsLabel: { display: "flex", flexDirection: "column", gap: 3 },
  settingsLabelTitle: { fontSize: 14, fontWeight: 500, color: "#e8f0eb" },
  settingsLabelSub: { fontSize: 12, color: "#4a6b56" },
  divider: { height: 1, background: "rgba(29,158,117,0.08)", margin: "0 20px" },
  actionBtn: { padding: "8px 16px", background: "rgba(29,158,117,0.1)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 8, fontSize: 13, color: "#1D9E75", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  roleBadge: { fontSize: 12, padding: "4px 12px", background: "rgba(29,158,117,0.12)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.25)", borderRadius: 10 },

  themeOptions: { display: "flex", gap: 8 },
  themeOption: { padding: "7px 14px", background: "rgba(8,15,10,0.5)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 8, fontSize: 13, color: "#7a9e88", cursor: "pointer" },
  themeOptionActive: { background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.35)", color: "#e8f0eb" },
  colorDots: { display: "flex", gap: 8 },
  colorDot: { width: 24, height: 24, borderRadius: "50%", cursor: "pointer" },
  colorDotActive: { outline: "2px solid #fff", outlineOffset: 2 },

  dangerDesc: { fontSize: 14, color: "#4a6b56", marginBottom: 20, lineHeight: 1.6 },
  dangerGroup: { background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 12, overflow: "hidden" },
  dangerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", gap: 16 },
  logoutBtn: { padding: "8px 16px", background: "transparent", border: "1px solid rgba(232,240,235,0.15)", borderRadius: 8, fontSize: 13, color: "#e8f0eb", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },
  deleteBtn: { padding: "8px 16px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 8, fontSize: 13, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 },

  saveBar: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, padding: "16px 32px", borderTop: "1px solid rgba(29,158,117,0.1)", background: "rgba(8,15,10,0.3)" },
  savedMsg: { fontSize: 13, color: "#1D9E75" },
  saveBtn: { padding: "10px 22px", background: "#1D9E75", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14 },
}
