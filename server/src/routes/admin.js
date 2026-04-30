import express from 'express'
import {
  getAllUsers,
  getComplaints,
  fileComplaint,
  blockUser,
  unblockUser,
  getAdminRequests,
  handleAdminRequest,
  markComplaintReviewed
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

router.use(protect) // all routes require login

// Any logged-in user can file a complaint
router.post('/complaint', upload.single('screenshot'), fileComplaint)

// Everything below is admin-only
router.use(adminOnly)

router.get('/users', getAllUsers)                           // see all users
router.get('/complaints', getComplaints)                   // see all complaints
router.put('/complaints/:id/review', markComplaintReviewed) // mark as reviewed
router.put('/block/:id', blockUser)                        // block a user
router.put('/unblock/:id', unblockUser)                    // unblock a user
router.get('/requests', getAdminRequests)                  // see pending admin requests
router.put('/requests/:id', handleAdminRequest)            // approve or reject

export default router