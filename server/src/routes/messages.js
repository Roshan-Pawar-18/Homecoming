import express from 'express'
import {
  getConversations,
  getMessagesWith,
  sendMessage,
  deleteMessage
} from '../controllers/messageController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/conversations', getConversations)    // list all your chats
router.get('/:userId', getMessagesWith)           // full chat with one person
router.post('/:userId', sendMessage)              // send a message
router.delete('/:messageId', deleteMessage)       // delete your own message

export default router