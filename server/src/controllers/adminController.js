import User from '../models/User.js'
import Complaint from '../models/Complaint.js'
import AdminRequest from '../models/AdminRequest.js'

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/admin/complaint
// Any logged-in user can report another user
export const fileComplaint = async (req, res) => {
  try {
    const { accusedUserId, reason } = req.body

    if (!accusedUserId || !reason)
      return res.status(400).json({ message: 'Accused user and reason are required' })

    // screenshot is uploaded to Cloudinary via multer — req.file.path is the URL
    const screenshot = req.file?.path || null

    const complaint = await Complaint.create({
      complainant: req.user._id,
      accusedUserId,
      reason,
      screenshot,
      status: 'pending'
    })

    res.status(201).json(complaint)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/complaints
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('complainant', 'name email profilePic role')
      .populate('accusedUserId', 'name email profilePic role')
      .sort({ createdAt: -1 })
    res.json(complaints)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/complaints/:id/review
// Admin marks a complaint as reviewed after taking action
export const markComplaintReviewed = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: 'reviewed' },
      { new: true }
    )
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
    res.json(complaint)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/block/:id
// Blocked users see "Account blocked" message when they try to login
export const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    ).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: `${user.name} has been blocked`, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/unblock/:id
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    ).select('-password')

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: `${user.name} has been unblocked`, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/admin/requests
// See all pending admin signup requests
export const getAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/admin/requests/:id
// Body: { status: 'approved' } or { status: 'rejected' }
export const handleAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Request not found' })

    request.status = req.body.status
    await request.save()

    // If approved → create a real User account with admin role
    // Password is already hashed from when they signed up
    if (req.body.status === 'approved') {
      const alreadyExists = await User.findOne({ email: request.email })
      if (!alreadyExists) {
        await User.create({
          name: request.name,
          email: request.email,
          password: request.password,
          role: 'admin'
        })
      }
    }

    res.json({ message: `Admin request ${req.body.status} successfully` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}