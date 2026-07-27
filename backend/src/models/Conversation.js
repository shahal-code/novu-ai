import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

// Index for fast user conversation lookups
conversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model('Conversation', conversationSchema);
