import express from 'express'
import { getFeed, createPost, likePost, addComment } from '../controllers/postController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()
router.use(protect) // all post routes require login

router.get('/',              getFeed)
router.post('/', upload.single('image'), createPost) // image upload via Cloudinary
router.put('/:id/like',      likePost)
router.post('/:id/comment',  addComment)

export default router