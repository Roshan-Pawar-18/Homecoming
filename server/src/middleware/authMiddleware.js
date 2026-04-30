import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// This runs BEFORE any protected route handler
// It reads the token from the Authorization header, verifies it,
// and attaches the user to req.user so controllers can use it
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Fetch full user from DB (excludes password with -password)
    req.user = await User.findById(decoded.id).select('-password')
    next() // continue to the actual route handler
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

// Extra check — only admins can proceed
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}