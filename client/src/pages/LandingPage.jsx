import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

const features = [
  { icon: "🎓", title: "Alumni Mentorship", desc: "Connect with verified alumni who've walked your path and are ready to guide you forward." },
  { icon: "💼", title: "Opportunity Board", desc: "Exclusive jobs and internships posted directly by alumni — for students of this community." },
  { icon: "🤝", title: "Real Connections", desc: "Send requests, build your network, and message connections directly — no noise." },
  { icon: "🛡️", title: "Amber Badge", desc: "Verified alumni earn the Amber Badge — a mark of trust within the Homecoming ecosystem." },
  { icon: "📢", title: "Community Feed", desc: "Share milestones, experiences, and updates with a community that actually cares." },
  { icon: "⚙️", title: "Admin Command", desc: "Robust moderation tools ensure the platform stays safe and meaningful for everyone." },
]

const steps = [
  { num: "01", title: "Sign Up", desc: "Create your account as a Student or Alumni in under a minute." },
  { num: "02", title: "Build Profile", desc: "Add your education, skills, experience and certificates." },
  { num: "03", title: "Connect", desc: "Send connection requests to alumni or students you want to know." },
  { num: "04", title: "Explore", desc: "Browse the feed, discover opportunities, and message connections." },
  { num: "05", title: "Grow", desc: "Get mentored, give back, and build lifelong professional bonds." },
  { num: "06", title: "Thrive", desc: "Land your dream role with guidance from those who made it." },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)
  const [treePath, setTreePath] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Animate tree growth
  useEffect(() => {
    let frame = 0
    const total = 120
    const grow = () => {
      frame++
      setTreePath(Math.min(frame / total, 1))
      if (frame < total) requestAnimationFrame(grow)
    }
    const timeout = setTimeout(() => requestAnimationFrame(grow), 600)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div style={styles.root}>
      {/* Ambient background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.logoIcon}>⌂</span>
          <span style={styles.logoText}>Homecoming</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#how" style={styles.navLink}>How it works</a>
          <button style={styles.btnOutline} onClick={() => navigate("/login")}>Sign In</button>
          <button style={styles.btnPrimary} onClick={() => navigate("/login")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero} ref={heroRef}>
        <div style={styles.heroLeft}>
          <div style={styles.heroTag}>✦ Medicaps University Alumni Network</div>
          <h1 style={styles.heroTitle}>
            Reconnect with<br />
            your <em style={styles.heroEm}>Roots.</em>
          </h1>
          <p style={styles.heroSub}>
            A premium space where alumni mentor and students flourish.
            Bridging gaps through shared experience, real opportunities,
            and genuine community.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.btnHero} onClick={() => navigate("/login")}>
              Join the Network →
            </button>
            <button style={styles.btnHeroGhost} onClick={() => navigate("/login")}>
              I'm an Alumni
            </button>
          </div>
          <div style={styles.heroStats}>
            {[["Students", "2,400+"], ["Alumni", "800+"], ["Opportunities", "340+"]].map(([label, val]) => (
              <div key={label} style={styles.statItem}>
                <span style={styles.statVal}>{val}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Animated SVG Tree */}
        <div style={styles.heroRight}>
          <svg viewBox="0 0 320 380" style={styles.treeSvg}>
            {/* Trunk */}
            <line x1="160" y1="360" x2="160" y2="220"
              stroke="#1D9E75" strokeWidth="4" strokeLinecap="round"
              strokeDasharray="140" strokeDashoffset={140 * (1 - treePath)} />
            {/* Branch L1 */}
            <line x1="160" y1="280" x2="80" y2="200"
              stroke="#1D9E75" strokeWidth="3" strokeLinecap="round"
              strokeDasharray="100" strokeDashoffset={100 * (1 - Math.max(0, treePath - 0.2) / 0.8)} />
            {/* Branch R1 */}
            <line x1="160" y1="260" x2="240" y2="180"
              stroke="#1D9E75" strokeWidth="3" strokeLinecap="round"
              strokeDasharray="100" strokeDashoffset={100 * (1 - Math.max(0, treePath - 0.25) / 0.75)} />
            {/* Branch L2 */}
            <line x1="80" y1="200" x2="40" y2="140"
              stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="80" strokeDashoffset={80 * (1 - Math.max(0, treePath - 0.4) / 0.6)} />
            {/* Branch R2 */}
            <line x1="240" y1="180" x2="280" y2="120"
              stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="80" strokeDashoffset={80 * (1 - Math.max(0, treePath - 0.45) / 0.55)} />
            {/* Branch mid */}
            <line x1="160" y1="220" x2="120" y2="140"
              stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray="90" strokeDashoffset={90 * (1 - Math.max(0, treePath - 0.35) / 0.65)} />
            <line x1="160" y1="220" x2="200" y2="140"
              stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray="90" strokeDashoffset={90 * (1 - Math.max(0, treePath - 0.38) / 0.62)} />
            {/* Leaf nodes */}
            {treePath > 0.7 && [
              [40, 135, "#f59e0b"], [280, 115, "#f59e0b"],
              [120, 135, "#1D9E75"], [200, 135, "#1D9E75"],
              [80, 195, "#22c55e"], [240, 175, "#22c55e"],
            ].map(([cx, cy, fill], i) => (
              <circle key={i} cx={cx} cy={cy} r={8 * Math.min(1, (treePath - 0.7) / 0.3)}
                fill={fill} opacity={0.9} />
            ))}
            {/* Roots */}
            <line x1="160" y1="360" x2="100" y2="380" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="65" strokeDashoffset={65 * (1 - treePath)} />
            <line x1="160" y1="360" x2="220" y2="380" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="65" strokeDashoffset={65 * (1 - treePath)} />
            <line x1="160" y1="360" x2="150" y2="385" stroke="#0f6e56" strokeWidth="1.5" strokeLinecap="round"
              strokeDasharray="30" strokeDashoffset={30 * (1 - treePath)} />
          </svg>

          {/* Floating cards around tree */}
          {treePath > 0.8 && (
            <>
              <div style={{ ...styles.floatCard, top: "8%", right: "4%", animationDelay: "0s" }}>
                <span style={styles.floatIcon}>🎓</span>
                <div>
                  <div style={styles.floatTitle}>Alumni Mentor</div>
                  <div style={styles.floatSub}>Rohit Sharma · TCS</div>
                </div>
              </div>
              <div style={{ ...styles.floatCard, top: "42%", left: "0%", animationDelay: "0.3s" }}>
                <span style={styles.floatIcon}>💼</span>
                <div>
                  <div style={styles.floatTitle}>Frontend Dev</div>
                  <div style={styles.floatSub}>Mindtree · ₹8 LPA</div>
                </div>
              </div>
              <div style={{ ...styles.floatCard, bottom: "12%", right: "2%", animationDelay: "0.6s" }}>
                <span style={styles.floatIcon}>🤝</span>
                <div>
                  <div style={styles.floatTitle}>Connected!</div>
                  <div style={styles.floatSub}>Priya accepted</div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionTag}>✦ Platform Features</div>
        <h2 style={styles.sectionTitle}>Everything you need to<br />grow your career</h2>
        <div style={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} style={{ ...styles.featureCard, animationDelay: `${i * 0.1}s` }}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={styles.section}>
        <div style={styles.sectionTag}>✦ How It Works</div>
        <h2 style={styles.sectionTitle}>Six steps to your<br />dream career</h2>
        <div style={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>{s.num}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Your alumni network is waiting.</h2>
          <p style={styles.ctaSub}>Join thousands of students and alumni building real connections at Medicaps.</p>
          <button style={styles.btnHero} onClick={() => navigate("/login")}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <span style={styles.logoIcon}>⌂</span>
          <span style={styles.logoText}>Homecoming</span>
        </div>
        <p style={styles.footerSub}>Medicaps University · Department of CS&E · 2026</p>
        <p style={styles.footerSub}>Built by Abhay Singh Parihar & Abhishek Gangrade</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080f0a; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbPulse { 0%,100%{opacity:0.18} 50%{opacity:0.32} }
      `}</style>
    </div>
  )
}

const styles = {
  root: { minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", position: "relative" },
  orb1: { position: "fixed", top: "-20%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, #1D9E7544 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 6s ease-in-out infinite" },
  orb2: { position: "fixed", top: "40%", right: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, #f59e0b22 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 8s ease-in-out infinite 2s" },
  orb3: { position: "fixed", bottom: "-10%", left: "30%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, #0f6e5622 0%, transparent 70%)", pointerEvents: "none", animation: "orbPulse 10s ease-in-out infinite 4s" },

  nav: { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 60px", background: "rgba(8,15,10,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(29,158,117,0.15)" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 22, color: "#1D9E75" },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8f0eb" },
  navLinks: { display: "flex", alignItems: "center", gap: 28 },
  navLink: { color: "#9eb8a6", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" },

  hero: { minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 60px 80px", gap: 60, maxWidth: 1280, margin: "0 auto" },
  heroLeft: { flex: 1 },
  heroTag: { display: "inline-block", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: "#1D9E75", background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.25)", borderRadius: 20, padding: "5px 14px", marginBottom: 28 },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 64, fontWeight: 700, lineHeight: 1.1, color: "#e8f0eb", marginBottom: 24 },
  heroEm: { fontStyle: "italic", color: "#1D9E75" },
  heroSub: { fontSize: 17, lineHeight: 1.7, color: "#7a9e88", maxWidth: 460, marginBottom: 40 },
  heroBtns: { display: "flex", gap: 16, marginBottom: 52 },
  heroStats: { display: "flex", gap: 40 },
  statItem: { display: "flex", flexDirection: "column", gap: 3 },
  statVal: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#1D9E75" },
  statLabel: { fontSize: 12, color: "#7a9e88", fontWeight: 500, letterSpacing: "0.05em" },

  heroRight: { flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 },
  treeSvg: { width: "100%", maxWidth: 320, filter: "drop-shadow(0 0 40px rgba(29,158,117,0.3))" },

  floatCard: { position: "absolute", display: "flex", alignItems: "center", gap: 10, background: "rgba(15,25,18,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 12, padding: "10px 16px", animation: "float 4s ease-in-out infinite" },
  floatIcon: { fontSize: 20 },
  floatTitle: { fontSize: 13, fontWeight: 600, color: "#e8f0eb" },
  floatSub: { fontSize: 11, color: "#7a9e88" },

  section: { maxWidth: 1280, margin: "0 auto", padding: "100px 60px" },
  sectionTag: { fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", color: "#1D9E75", marginBottom: 16 },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 700, color: "#e8f0eb", marginBottom: 60, lineHeight: 1.2 },

  featureGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  featureCard: { background: "rgba(15,25,18,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 16, padding: "32px 28px", transition: "border-color 0.3s, transform 0.3s", cursor: "default" },
  featureIcon: { fontSize: 32, marginBottom: 16 },
  featureTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8f0eb", marginBottom: 10 },
  featureDesc: { fontSize: 14, lineHeight: 1.7, color: "#7a9e88" },

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 },
  stepCard: { position: "relative", padding: "32px 28px", background: "rgba(15,25,18,0.4)", border: "1px solid rgba(29,158,117,0.1)", borderRadius: 16 },
  stepNum: { fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: "rgba(29,158,117,0.2)", marginBottom: 16, lineHeight: 1 },
  stepTitle: { fontSize: 18, fontWeight: 600, color: "#e8f0eb", marginBottom: 10 },
  stepDesc: { fontSize: 14, lineHeight: 1.7, color: "#7a9e88" },

  cta: { margin: "0 60px 100px", background: "linear-gradient(135deg, rgba(29,158,117,0.15) 0%, rgba(245,158,11,0.08) 100%)", border: "1px solid rgba(29,158,117,0.2)", borderRadius: 24, padding: "80px 60px", textAlign: "center" },
  ctaInner: { maxWidth: 600, margin: "0 auto" },
  ctaTitle: { fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: "#e8f0eb", marginBottom: 16 },
  ctaSub: { fontSize: 16, color: "#7a9e88", marginBottom: 36 },

  footer: { textAlign: "center", padding: "40px 60px 60px", borderTop: "1px solid rgba(29,158,117,0.1)" },
  footerSub: { fontSize: 13, color: "#4a6b56", marginTop: 8 },

  btnPrimary: { padding: "10px 22px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  btnOutline: { padding: "10px 22px", background: "transparent", color: "#e8f0eb", border: "1px solid rgba(232,240,235,0.2)", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  btnHero: { padding: "14px 28px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" },
  btnHeroGhost: { padding: "14px 28px", background: "transparent", color: "#e8f0eb", border: "1px solid rgba(232,240,235,0.2)", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
}
