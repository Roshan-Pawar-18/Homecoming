import express from 'express'
import {
  getFeed,
  createPost,
  likePost,
  addComment,
  deletePost
} from '../controllers/postController.js'
import { protect } from '../middleware/authMiddleware.js'
import { upload } from '../config/cloudinary.js'

const router = express.Router()

router.use(protect)

router.get('/', getFeed)                                   // get all posts
router.post('/', upload.single('image'), createPost)       // create post (optional image)
router.put('/:id/like', likePost)                          // like or unlike a post
router.post('/:id/comment', addComment)                    // add a comment
router.delete('/:id', deletePost)                          // delete your own post

export default router