import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blitz';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'blitz_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seedAdmin() {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === 'replace-with-strong-password') {
    console.error(
      'Error: Please set a secure ADMIN_PASSWORD in your .env file before running the seed script.',
    );
    process.exit(1);
  }

  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const adminSchema = new mongoose.Schema(
      {
        _id: { type: String, default: () => uuidv4() },
        username: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
      },
      { timestamps: true, collection: 'admins' },
    );

    const AdminModel = mongoose.model('Admin', adminSchema);

    const existingCount = await AdminModel.countDocuments();
    if (existingCount > 0) {
      console.log(
        'An administrator account already exists. Seeding skipped to preserve existing credentials.',
      );
      await mongoose.disconnect();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const newAdmin = new AdminModel({
      _id: uuidv4(),
      username: ADMIN_USERNAME,
      passwordHash,
    });

    await newAdmin.save();
    console.log(`Admin user "${ADMIN_USERNAME}" seeded successfully with UUID: ${newAdmin._id}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
