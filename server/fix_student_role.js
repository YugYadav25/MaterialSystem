const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const emailToFix = '24me001@charusat.edu.in';

mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/material-system')
    .then(async () => {
        console.log(`\n--- Fixing User ${emailToFix} ---`);
        const user = await User.findOne({ email: emailToFix });

        if (user) {
            console.log(`Found user. Current Role: '${user.role}'`);
            if (user.role !== 'student') {
                user.role = 'student';
                await user.save();
                console.log(`SUCCESS: Updated role to 'student'.`);
            } else {
                console.log('User already has correct role.');
            }
        } else {
            console.log('User NOT FOUND.');
        }

        mongoose.disconnect();
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
