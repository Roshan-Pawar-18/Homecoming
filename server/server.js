import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes         from './src/routes/auth.js'
import userRoutes         from './src/routes/users.js'
import postRoutes         from './src/routes/posts.js'
import messageRoutes      from './src/routes/messages.js'
import opportunityRoutes  from './src/routes/opportunities.js'
import adminRoutes        from './src/routes/admin.js'

const app = express()

// Allow requests from our React frontend
app.use(cors({ origin: process.env.FRONTEND_URL }))

// Parse incoming JSON bodies
app.use(express.json())

// Mount all route groups
app.use('/api/auth',          authRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/posts',         postRoutes)
app.use('/api/messages',      messageRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/admin',         adminRoutes)

// Health check — visit /api/health to confirm server is running
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Connect to MongoDB Atlas, then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    )
  })
  .catch(err => console.error('❌ DB connection failed:', err))