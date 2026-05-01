import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import * as api from "../api/index"
import Sidebar from "../components/Sidebar"

export default function FeedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [posting, setPosting] = useState(false)
  const [commentText, setCommentText] = useState({})
  const [expanded, setExpanded] = useState({})

  useEffect(() => { fetchFeed() }, [])

  const fetchFeed = async () => {
    try {
      const { data } = await api.getFeed()
      setPosts(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handlePost = async () => {
    if (!content.trim()) return
    setPosting(true)
    try {
      const form = new FormData()
      form.append("content", content)
      if (image) form.append("image", image)
      // Direct axios call for multipart
      const { data } = await api.createPost(form)
      setPosts([data, ...posts])
      setContent("")
      setImage(null)
      setImagePreview(null)
    } catch (e) { console.error(e) }
    setPosting(false)
  }

  const handleLike = async (postId) => {
    try {
      await api.likePost(postId)
      fetchFeed()
    } catch (e) { console.error(e) }
  }

  const handleComment = async (postId) => {
    const text = commentText[postId]
    if (!text?.trim()) return
    try {
      await api.commentPost(postId, text)
      setCommentText({ ...commentText, [postId]: "" })
      fetchFeed()
    } catch (e) { console.error(e) }
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const timeAgo = (date) => {
    const d = new Date(date)
    const diff = (Date.now() - d) / 1000
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea:focus, input:focus { outline: none; border-color: #1D9E75 !important; }
        textarea::placeholder, input::placeholder { color: #4a6b56; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1D9E7540; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <Sidebar active="feed" />

      <main style={s.main}>
        {/* Create post */}
        <div style={s.createCard}>
          <div style={s.createTop}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share an achievement, update, or thought..."
              style={s.textarea}
              rows={3}
            />
          </div>
          {imagePreview && (
            <div style={s.previewWrap}>
              <img src={imagePreview} alt="preview" style={s.preview} />
              <button style={s.removeImg} onClick={() => { setImage(null); setImagePreview(null) }}>✕</button>
            </div>
          )}
          <div style={s.createBottom}>
            <label style={s.photoBtn}>
              📷 Photo
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>
            <button style={{ ...s.postBtn, opacity: posting ? 0.7 : 1 }} onClick={handlePost} disabled={posting}>
              {posting ? "Posting..." : "✦ Post"}
            </button>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div style={s.loader}><div style={s.spinner} /></div>
        ) : posts.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🌱</div>
            <p style={s.emptyText}>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <div key={post._id} style={{ ...s.postCard, animationDelay: `${i * 0.05}s` }}>
              {/* Post header */}
              <div style={s.postHeader}>
                <div style={s.postAvatar} onClick={() => navigate(`/profile/${post.author._id}`)}>
                  {post.author.profilePic
                    ? <img src={post.author.profilePic} alt="" style={s.avatarImg} />
                    : <span>{post.author.name?.[0]?.toUpperCase()}</span>}
                </div>
                <div>
                  <div style={s.postAuthor}>
                    {post.author.name}
                    {post.author.role === "alumni" && <span style={s.amberBadge}>✦ Alumni</span>}
                    {post.author.role === "admin" && <span style={s.adminBadge}>Admin</span>}
                  </div>
                  <div style={s.postTime}>{timeAgo(post.createdAt)}</div>
                </div>
              </div>

              {/* Post content */}
              <p style={s.postContent}>{post.content}</p>
              {post.image && <img src={post.image} alt="post" style={s.postImg} />}

              {/* Actions */}
              <div style={s.postActions}>
                <button style={s.actionBtn} onClick={() => handleLike(post._id)}>
                  <span style={{ color: post.likes?.includes(user?._id) ? "#f59e0b" : "#7a9e88" }}>♥</span>
                  <span style={s.actionCount}>{post.likes?.length || 0}</span>
                </button>
                <button style={s.actionBtn} onClick={() => toggleExpand(post._id)}>
                  <span>💬</span>
                  <span style={s.actionCount}>{post.comments?.length || 0}</span>
                </button>
                <button style={s.actionBtn}>
                  <span>↗</span> Share
                </button>
              </div>

              {/* Comments */}
              {expanded[post._id] && (
                <div style={s.commentsSection}>
                  {post.comments?.map((c, ci) => (
                    <div key={ci} style={s.comment}>
                      <div style={s.commentAvatar}>{c.user?.name?.[0]?.toUpperCase()}</div>
                      <div style={s.commentBody}>
                        <span style={s.commentName}>{c.user?.name}</span>
                        <span style={s.commentText}> {c.text}</span>
                      </div>
                    </div>
                  ))}
                  <div style={s.commentInput}>
                    <div style={s.commentAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
                    <input
                      placeholder="Write a comment..."
                      value={commentText[post._id] || ""}
                      onChange={e => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyDown={e => e.key === "Enter" && handleComment(post._id)}
                      style={s.commentField}
                    />
                    <button style={s.sendBtn} onClick={() => handleComment(post._id)}>→</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Right sidebar — suggestions */}
      <aside style={s.rightAside}>
        <div style={s.asideCard}>
          <h3 style={s.asideTitle}>Quick Links</h3>
          {[
            { icon: "💼", label: "Browse Opportunities", path: "/opportunities" },
            { icon: "💬", label: "Messages", path: "/messages" },
            { icon: "👤", label: "My Profile", path: `/profile/${user?._id}` },
          ].map(({ icon, label, path }) => (
            <button key={label} style={s.asideLink} onClick={() => navigate(path)}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
        <div style={s.asideCard}>
          <h3 style={s.asideTitle}>Platform</h3>
          <p style={s.asideMeta}>Homecoming · Medicaps University</p>
          <p style={s.asideMeta}>Building alumni connections since 2026</p>
        </div>
      </aside>
    </div>
  )
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#080f0a", color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, maxWidth: 680, margin: "0 auto", padding: "90px 24px 40px" },

  createCard: { background: "rgba(15,25,18,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(29,158,117,0.18)", borderRadius: 16, padding: 20, marginBottom: 24 },
  createTop: { display: "flex", gap: 12, marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, flexShrink: 0 },
  textarea: { flex: 1, background: "rgba(8,15,10,0.5)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif", resize: "none", lineHeight: 1.6, transition: "border-color 0.2s" },
  previewWrap: { position: "relative", marginBottom: 12 },
  preview: { width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10 },
  removeImg: { position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 13 },
  createBottom: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  photoBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#7a9e88", cursor: "pointer", padding: "8px 14px", borderRadius: 8, background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.15)" },
  postBtn: { padding: "9px 22px", background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  loader: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 36, height: 36, border: "3px solid rgba(29,158,117,0.2)", borderTopColor: "#1D9E75", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  emptyState: { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: "#7a9e88", fontSize: 15 },

  postCard: { background: "rgba(15,25,18,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 16, padding: "20px 24px", marginBottom: 16, animation: "fadeUp 0.4s both" },
  postHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  postAvatar: { width: 44, height: 44, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, cursor: "pointer", overflow: "hidden", flexShrink: 0 },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  postAuthor: { fontSize: 15, fontWeight: 600, color: "#e8f0eb", display: "flex", alignItems: "center", gap: 8 },
  amberBadge: { fontSize: 11, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "2px 8px" },
  adminBadge: { fontSize: 11, background: "rgba(29,158,117,0.15)", color: "#1D9E75", border: "1px solid rgba(29,158,117,0.3)", borderRadius: 10, padding: "2px 8px" },
  postTime: { fontSize: 12, color: "#4a6b56", marginTop: 2 },
  postContent: { fontSize: 15, lineHeight: 1.7, color: "#c8dfd2", marginBottom: 14 },
  postImg: { width: "100%", borderRadius: 12, marginBottom: 14, maxHeight: 400, objectFit: "cover" },

  postActions: { display: "flex", gap: 4, paddingTop: 12, borderTop: "1px solid rgba(29,158,117,0.1)" },
  actionBtn: { display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "transparent", border: "none", borderRadius: 8, fontSize: 14, color: "#7a9e88", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" },
  actionCount: { fontSize: 13 },

  commentsSection: { marginTop: 14, borderTop: "1px solid rgba(29,158,117,0.1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 },
  comment: { display: "flex", gap: 10, alignItems: "flex-start" },
  commentAvatar: { width: 30, height: 30, borderRadius: "50%", background: "#1D9E75", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 },
  commentBody: { background: "rgba(8,15,10,0.4)", borderRadius: 8, padding: "8px 12px", flex: 1 },
  commentName: { fontSize: 13, fontWeight: 600, color: "#e8f0eb" },
  commentText: { fontSize: 13, color: "#9eb8a6" },
  commentInput: { display: "flex", gap: 8, alignItems: "center" },
  commentField: { flex: 1, background: "rgba(8,15,10,0.5)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#e8f0eb", fontFamily: "'DM Sans', sans-serif" },
  sendBtn: { width: 34, height: 34, borderRadius: "50%", background: "#1D9E75", border: "none", color: "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },

  rightAside: { width: 280, padding: "90px 20px 40px", flexShrink: 0 },
  asideCard: { background: "rgba(15,25,18,0.8)", border: "1px solid rgba(29,158,117,0.12)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 },
  asideTitle: { fontSize: 14, fontWeight: 600, color: "#e8f0eb", marginBottom: 14 },
  asideLink: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: "transparent", border: "none", borderRadius: 8, fontSize: 14, color: "#9eb8a6", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left", marginBottom: 4, transition: "background 0.2s" },
  asideMeta: { fontSize: 12, color: "#4a6b56", lineHeight: 1.6 },
}
