import { ENV } from '../config/env.js';
import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}
