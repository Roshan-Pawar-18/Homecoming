import mongoose from 'mongoose'

const adminRequestSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  password: { type: String, required: true }, // hashed
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true })

export default mongoose.model('AdminRequest', adminRequestSchema)