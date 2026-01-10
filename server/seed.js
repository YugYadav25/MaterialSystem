require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL; // Handle both naming conventions

        if (!mongoUri) {
            console.error('MONGO_URI or MONGO_URL is missing in .env file');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected for Seeding');

        // Optional: Clear existing users if needed, or just upsert. 
        // For safety, let's just check existence before creating.

        const usersToCreate = [];

        for (let i = 1; i <= 120; i++) {
            const suffix = i.toString().padStart(3, '0');
            const email = `24me${suffix}@charusat.edu.in`;
            const passwordPlain = i.toString(); // '1', '2', ... '120'
            const name = `Student ${suffix}`;

            const hashedPassword = await bcrypt.hash(passwordPlain, 10);

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                usersToCreate.push({
                    name,
                    email,
                    password: hashedPassword
                });
            } else {
                // Update existing user's password to match new format
                existingUser.password = hashedPassword;
                await existingUser.save();
            }
        }

        if (usersToCreate.length > 0) {
            await User.insertMany(usersToCreate);
            console.log(`Successfully created ${usersToCreate.length} new users.`);
        }

        // Seed Admin Account
        const adminEmail = 'admin@charusat.edu.in';
        const adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            const hashedAdminPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: hashedAdminPassword,
                role: 'admin'
            });
            console.log('Admin Account Created');
        } else {
            console.log('Admin Account Already Exists');
        }

        console.log('Finished processing all 120 users (created or updated).');

        mongoose.disconnect();
        console.log('Seeding Completed');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedUsers();
