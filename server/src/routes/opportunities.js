import express from 'express'
import {
  getOpportunities,
  createOpportunity,
  deleteOpportunity,
  getMyOpportunities
} from '../controllers/opportunityController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', getOpportunities)               // all users can browse
router.get('/mine', getMyOpportunities)          // alumni sees their own posts
router.post('/', createOpportunity)              // alumni only can create
router.delete('/:id', deleteOpportunity)         // poster or admin can delete

export default router