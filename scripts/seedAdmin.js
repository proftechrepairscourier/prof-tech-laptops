import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin already exists.');
  } else {
    await Admin.create({ email, password, name: 'PROF TECH Admin' });
    console.log(`Admin created: ${email}`);
  }
  process.exit(0);
};
run();