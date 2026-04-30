import Post from '../models/Post.js'

export const getFeed = async (req, res) => {
  // Populate author details, sort newest first
  const posts = await Post.find()
    .populate('author', 'name profilePic role')
    .sort({ createdAt: -1 })
  res.json(posts)
}

export const createPost = async (req, res) => {
  const { content } = req.body
  // req.file is set by multer/Cloudinary — contains the uploaded image URL
  const image = req.file?.path || null
  const post = await Post.create({ author: req.user._id, content, image })
  await post.populate('author', 'name profilePic role')
  res.status(201).json(post)
}

export const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id)
  const alreadyLiked = post.likes.includes(req.user._id)
  // Toggle: like if not liked, unlike if already liked
  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString())
  } else {
    post.likes.push(req.user._id)
  }
  await post.save()
  res.json(post)
}

export const addComment = async (req, res) => {
  const post = await Post.findById(req.params.id)
  post.comments.push({ user: req.user._id, text: req.body.text })
  await post.save()
  await post.populate('comments.user', 'name profilePic')
  res.json(post)
}