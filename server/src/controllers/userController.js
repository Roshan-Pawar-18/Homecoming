import User from '../models/User.js'
import Connection from '../models/Connection.js'

// GET /api/users/me
export const getMe = async (req, res) => {
  try {
    // req.user is attached by authMiddleware after verifying JWT token
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/users/me
export const updateMe = async (req, res) => {
  try {
    const updates = { ...req.body }

    // If skills or education sent as JSON string (from FormData), parse them
    if (typeof updates.skills === 'string') {
      updates.skills = JSON.parse(updates.skills)
    }
    if (typeof updates.education === 'string') {
      updates.education = JSON.parse(updates.education)
    }
    if (typeof updates.experience === 'string') {
      updates.experience = JSON.parse(updates.experience)
    }
    if (typeof updates.certificates === 'string') {
      updates.certificates = JSON.parse(updates.certificates)
    }

    // If a profile photo was uploaded, req.file.path is the Cloudinary URL
    if (req.file) updates.profilePic = req.file.path

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/search?q=Abhay
export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || ''
    // $regex = partial match, $options:'i' = case-insensitive
    const users = await User.find({
      name: { $regex: query, $options: 'i' },
      isBlocked: false  // don't show blocked users in search
    }).select('name role profilePic bio skills')
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/connections
export const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connections', 'name role profilePic bio skills')
    res.json(user.connections)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/users/requests/pending
// Returns all incoming connection requests waiting for your response
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'name profilePic role bio')
    res.json(requests)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/users/connect/:id
export const sendConnectionRequest = async (req, res) => {
  try {
    // Prevent sending request to yourself
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot connect with yourself' })

    // Prevent duplicate requests
    const existing = await Connection.findOne({
      requester: req.user._id,
      recipient: req.params.id
    })
    if (existing)
      return res.status(400).json({ message: 'Connection request already sent' })

    const connection = await Connection.create({
      requester: req.user._id,
      recipient: req.params.id,
      status: 'pending'
    })

    res.status(201).json(connection)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/users/connect/:id
// Body: { status: 'accepted' } or { status: 'rejected' }
export const respondToConnection = async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      {
        requester: req.params.id,   // the person who sent the request
        recipient: req.user._id     // must be YOU receiving it
      },
      { status: req.body.status },
      { new: true }
    )

    if (!connection)
      return res.status(404).json({ message: 'Connection request not found' })

    // If accepted, add each user to the other's connections[] array
    // $addToSet prevents duplicates (safer than $push)
    if (req.body.status === 'accepted') {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { connections: req.params.id }
      })
      await User.findByIdAndUpdate(req.params.id, {
        $addToSet: { connections: req.user._id }
      })
    }

    res.json(connection)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}