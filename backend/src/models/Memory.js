import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    facts: [
      {
        text: { type: String, required: true },   // e.g. "User's name is John"
        createdAt: { type: Date, default: Date.now },
      },
    ],
    preferences: {
      language: { type: String, default: null },  // detected language code e.g. 'es'
      responseStyle: { type: String, default: null }, // 'concise' | 'detailed'
    },
  },
  { timestamps: true }
);

export default mongoose.model('Memory', memorySchema);
