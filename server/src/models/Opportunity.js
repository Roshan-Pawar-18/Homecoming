import mongoose from 'mongoose'

const opportunitySchema = new mongoose.Schema({
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  description: String,
  link:        String,
  type:        { type: String, enum: ['job', 'internship'], default: 'job' },
}, { timestamps: true })

export default mongoose.model('Opportunity', opportunitySchema)