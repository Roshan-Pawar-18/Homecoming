import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AdminRequest from '../models/AdminRequest.js'

// Generate a JWT that expires in 7 days
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' })

    // Admin signup goes through approval queue — not direct account creation
    if (role === 'admin') {
      const hashed = await bcrypt.hash(password, 12)
      await AdminRequest.create({ name, email, password: hashed })
      return res.status(201).json({ message: 'Admin request submitted for approval' })
    }

    // Hash password before saving (never store plain text)
    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed, role })
    res.status(201).json({ user, token: generateToken(user._id) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password, role } = req.body
  try {
    const user = await User.findOne({ email, role })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Incorrect password' })

    res.json({ user, token: generateToken(user._id) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}