// Already handled inside server.js — this file is optional
// but useful if you want to separate DB logic later
import mongoose from 'mongoose'

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')
}