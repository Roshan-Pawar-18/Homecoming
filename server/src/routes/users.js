import express from 'express'
import {
  getMe,
  updateMe,
  getUserById,
  searchUsers,
  sendConnectionRequest,
  respondToConnection,
  getConnections,
  getPendingRequests
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

// All user routes require the user to be logged in
router.use(protect)

router.get('/me', getMe)                                      // your own profile
router.put('/me', upload.single('profilePic'), updateMe)      // update profile + photo
router.get('/search', searchUsers)                            // search by name
router.get('/connections', getConnections)                    // your connection list
router.get('/requests/pending', getPendingRequests)           // incoming requests
router.get('/:id', getUserById)                               // anyone's profile
router.post('/connect/:id', sendConnectionRequest)            // send request
router.put('/connect/:id', respondToConnection)               // accept or reject

export default router