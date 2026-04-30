import Post from '../models/Post.js'

// GET /api/posts
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name profilePic role')           // show author info on each post
      .populate('comments.user', 'name profilePic')         // show commenter info
      .sort({ createdAt: -1 })                              // newest post first
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { content } = req.body

    if (!content || content.trim() === '')
      return res.status(400).json({ message: 'Post content cannot be empty' })

    // req.file is set by multer when an image is uploaded
    // req.file.path is the full Cloudinary URL
    const image = req.file?.path || null

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image
    })

    // Populate author before sending response so frontend has all user info
    await post.populate('author', 'name profilePic role')

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/posts/:id/like
// If already liked → unlike. If not liked → like. (Toggle)
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const userId = req.user._id.toString()
    const alreadyLiked = post.likes.some(id => id.toString() === userId)

    if (alreadyLiked) {
      // Remove the user's ID from likes array
      post.likes = post.likes.filter(id => id.toString() !== userId)
    } else {
      // Add the user's ID to likes array
      post.likes.push(req.user._id)
    }

    await post.save()
    res.json({ likes: post.likes, liked: !alreadyLiked })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/posts/:id/comment
export const addComment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text || text.trim() === '')
      return res.status(400).json({ message: 'Comment cannot be empty' })

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    post.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    })

    await post.save()

    // Populate comment authors before sending response
    await post.populate('comments.user', 'name profilePic')
    res.json(post.comments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    // Only the author or an admin can delete a post
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized to delete this post' })

    await post.deleteOne()
    res.json({ message: 'Post deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}