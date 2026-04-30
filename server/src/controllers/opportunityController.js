import Opportunity from '../models/Opportunity.js'

// GET /api/opportunities
export const getOpportunities = async (req, res) => {
  try {
    // Optional filter: ?type=job or ?type=internship
    const filter = {}
    if (req.query.type) filter.type = req.query.type

    const opportunities = await Opportunity.find(filter)
      .populate('postedBy', 'name profilePic role')
      .sort({ createdAt: -1 })

    res.json(opportunities)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/opportunities/mine
export const getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
    res.json(opportunities)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/opportunities
export const createOpportunity = async (req, res) => {
  try {
    // Only alumni are allowed to post opportunities
    if (req.user.role !== 'alumni')
      return res.status(403).json({ message: 'Only alumni can post opportunities' })

    const { title, company, description, link, type } = req.body

    if (!title || !company)
      return res.status(400).json({ message: 'Title and company are required' })

    const opportunity = await Opportunity.create({
      postedBy: req.user._id,
      title,
      company,
      description,
      link,
      type: type || 'job'
    })

    await opportunity.populate('postedBy', 'name profilePic role')
    res.status(201).json(opportunity)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/opportunities/:id
export const deleteOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id)
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' })

    // Only the original poster OR an admin can delete
    const isOwner = opp.postedBy.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to delete this' })

    await opp.deleteOne()
    res.json({ message: 'Opportunity deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}