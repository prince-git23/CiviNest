import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

async function inspect() {
  await connectDB();
  const db = mongoose.connection.db!;
  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`${c.name}: ${count}`);
  }
  // Sample a user + report shape
  const users = await db.collection('users').find().limit(8).toArray();
  for (const u of users) {
    console.log('user:', u.email, '| role:', u.role, '| ward:', u.ward, '| city:', u.city, '| locality:', u.locality);
  }
  await mongoose.disconnect();
}

inspect().catch((e) => { console.error(e); process.exit(1); });
