import mongoose from 'mongoose'
import { initAdmin } from '../initAdmin.js';

// MongoDB connection
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
      await initAdmin();
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  }
};