import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
  },
  googleId: { type: String, unique: true, sparse: true },
  name: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
