import mongoose from 'mongoose'

const complaintSchema = new mongoose.Schema({
  complainant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accusedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason:        String,
  screenshot:    String, // Cloudinary URL
  status:        { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
}, { timestamps: true })

export default mongoose.model('Complaint', complaintSchema)