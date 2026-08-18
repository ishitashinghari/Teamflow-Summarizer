import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import ReadState from '../models/ReadState.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed Engine] MongoDB Connected.');

    console.log('[Seed Engine] Wiping obsolete testing documents...');
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Message.deleteMany({}),
      ReadState.deleteMany({}),
    ]);

    console.log('[Seed Engine] Inserting mock users (Note: Must register via Firebase to obtain valid JWTs for UI)...');
    const u1 = await User.create({
      firebaseUid: 'DEMO_FIREBASE_UID_1',
      name: 'Alex Rivera',
      username: 'alexrivera',
      email: 'alex@teamflow.internal',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      statusMessage: 'Leading the Sprint 🚀',
    });

    const u2 = await User.create({
      firebaseUid: 'DEMO_FIREBASE_UID_2',
      name: 'Sophia Chen',
      username: 'sophiac',
      email: 'sophia@teamflow.internal',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      statusMessage: 'Reviewing PRs',
    });

    const group = await Group.create({
      name: 'Core Engineering & AI',
      description: 'Main product architecture, sprint deadlines, and AI pipeline discussions.',
      groupImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
      owner: u1._id,
      admins: [u1._id],
      members: [u1._id, u2._id],
      inviteCode: 'TF-COR99',
    });

    // Generate Conversation History
    const m1 = await Message.create({
      group: group._id,
      sender: u1._id,
      text: 'Good morning everyone! Let us review the upcoming product release deliverables.',
      createdAt: new Date(Date.now() - 1000 * 60 * 180),
    });

    const m2 = await Message.create({
      group: group._id,
      sender: u2._id,
      text: 'Frontend auth integration with Firebase ID tokens is done and verified on the client.',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    });

    const m3 = await Message.create({
      group: group._id,
      sender: u1._id,
      text: 'Awesome. Deadline for AI Summarization endpoint testing is Friday at 5:00 PM EST. Please ensure token caps are respected.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    });

    const m4 = await Message.create({
      group: group._id,
      sender: u2._id,
      text: 'Understood. I will run load tests on the Socket.IO cluster before merging.',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    });

    // Simulate unread cursor: u2 has read up to m1, leaving m2, m3, m4 unread for testing summarizer
    await ReadState.create({
      user: u2._id,
      group: group._id,
      lastReadMessage: m1._id,
      lastReadAt: new Date(Date.now() - 1000 * 60 * 150),
    });

    console.log('[Seed Engine] Seed complete! Group Invite Code: TF-COR99');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();