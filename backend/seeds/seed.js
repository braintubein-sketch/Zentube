import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Zentube Admin',
            email: process.env.ADMIN_EMAIL || 'admin@zentro.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            role: 'admin',
            channelName: 'Zentube Official',
            avatar: 'https://ui-avatars.com/api/?name=Zentube+Admin&background=7c3aed&color=fff&size=200',
            bio: 'Official Zentube platform admin account.',
        });

        console.log('✅ Admin user created successfully!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
        console.log(`   Role: ${admin.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
};

seedAdmin();
