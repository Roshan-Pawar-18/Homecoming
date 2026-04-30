import Message from '../models/Message.js'
import User from '../models/User.js'

// GET /api/messages/conversations
// Returns the last message from each unique conversation partner
export const getConversations = async (req, res) => {
  try {
    const myId = req.user._id

    // Find every message where I am sender OR receiver
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profilePic role')
      .populate('receiver', 'name profilePic role')

    // Build a deduplicated list — one entry per conversation partner
    const seen = new Map()
    for (const msg of messages) {
      // The "other person" is whoever is NOT me in this message
      const other = msg.sender._id.toString() === myId.toString()
        ? msg.receiver
        : msg.sender

      // Only keep the first (most recent) message per conversation
      if (!seen.has(other._id.toString())) {
        seen.set(other._id.toString(), {
          user: other,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isFromMe: msg.sender._id.toString() === myId.toString()
          }
        })
      }
    }

    res.json([...seen.values()])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/messages/:userId
// Full chat history between me and one other user
export const getMessagesWith = async (req, res) => {
  try {
    const myId = req.user._id
    const otherId = req.params.userId

    const messages = await Message.find({
      // $or finds messages sent in BOTH directions of the conversation
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId }
      ]
    })
      .sort({ createdAt: 1 })                           // oldest first (chat order)
      .populate('sender', 'name profilePic role')
      .populate('receiver', 'name profilePic role')

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/messages/:userId
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body

    if (!content || content.trim() === '')
      return res.status(400).json({ message: 'Message cannot be empty' })

    // Optional: check they are connected before allowing message
    const sender = await User.findById(req.user._id)
    const isConnected = sender.connections
      .map(id => id.toString())
      .includes(req.params.userId)

    // Allow admin to message anyone
    if (!isConnected && req.user.role !== 'admin')
      return res.status(403).json({ message: 'You can only message your connections' })

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      content: content.trim()
    })

    await message.populate('sender', 'name profilePic role')
    await message.populate('receiver', 'name profilePic role')

    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/messages/:messageId
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
    if (!message) return res.status(404).json({ message: 'Message not found' })

    // Only the sender can delete their own message
    if (message.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' })

    await message.deleteOne()
    res.json({ message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}