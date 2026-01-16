const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const emailToCheck = '24me001@charusat.edu.in';

// Helper to clean up output
const printUser = (u) => {
    if (!u) return 'Not Found';
    return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role, // This is the critical field
        hasSubmitted: u.hasSubmitted
    };
};

mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/material-system')
    .then(async () => {
        console.log(`\n--- Checking Database for ${emailToCheck} ---`);
        const user = await User.findOne({ email: emailToCheck });

        if (user) {
            console.log('User FOUND in DB:');
            console.log(JSON.stringify(printUser(user), null, 2));
        } else {
            console.log('User NOT FOUND in DB.');
        }

        console.log(`\n--- Checking Comparison User (24me002@charusat.edu.in) ---`);
        const user2 = await User.findOne({ email: '24me002@charusat.edu.in' });
        console.log('User 002:', JSON.stringify(printUser(user2), null, 2));

        mongoose.disconnect();
    })
    .catch(err => {
        console.error("DB Connection Error:", err);
        process.exit(1);
    });
