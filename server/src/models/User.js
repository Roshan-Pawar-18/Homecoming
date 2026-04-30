import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  bio:        String,
  profilePic: String,            // Cloudinary URL
  education:  [{ school: String, degree: String, year: String }],
  skills:     [String],
  experience: [{ company: String, role: String, duration: String }],
  certificates: [{ title: String, issuer: String, url: String }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBlocked:  { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('User', userSchema)