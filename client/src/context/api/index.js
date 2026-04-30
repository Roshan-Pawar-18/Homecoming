import axios from 'axios'

// Base URL comes from .env file
// In development: http://localhost:5000
// In production: your Render backend URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// AUTH
export const signup = (data) => API.post('/api/auth/signup', data)
export const login  = (data) => API.post('/api/auth/login', data)

// USERS
export const getMe         = ()       => API.get('/api/users/me')
export const getUser       = (id)     => API.get(`/api/users/${id}`)
export const updateProfile = (data)   => API.put('/api/users/me', data)
export const searchUsers   = (query)  => API.get(`/api/users/search?q=${query}`)
export const sendConnect   = (id)     => API.post(`/api/users/connect/${id}`)

// POSTS
export const getFeed       = ()       => API.get('/api/posts')
export const createPost    = (data)   => API.post('/api/posts', data)
export const likePost      = (id)     => API.put(`/api/posts/${id}/like`)
export const commentPost   = (id, text) => API.post(`/api/posts/${id}/comment`, { text })

// MESSAGES
export const getConversations = ()   => API.get('/api/messages/conversations')
export const getMessages   = (userId) => API.get(`/api/messages/${userId}`)
export const sendMessage   = (userId, content) => API.post(`/api/messages/${userId}`, { content })

// OPPORTUNITIES
export const getOpportunities  = ()     => API.get('/api/opportunities')
export const createOpportunity = (data) => API.post('/api/opportunities', data)
export const deleteOpportunity = (id)   => API.delete(`/api/opportunities/${id}`)

// ADMIN
export const getComplaints   = ()     => API.get('/api/admin/complaints')
export const blockUser       = (id)   => API.put(`/api/admin/block/${id}`)
export const unblockUser     = (id)   => API.put(`/api/admin/unblock/${id}`)
export const getAdminRequests = ()    => API.get('/api/admin/requests')
export const handleAdminReq  = (id, status) => API.put(`/api/admin/requests/${id}`, { status })
export const fileComplaint   = (data) => API.post('/api/admin/complaint', data)