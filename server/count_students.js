require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');

const run = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
        if (!MONGO_URI) { console.error("No URI"); process.exit(1); }

        await mongoose.connect(MONGO_URI);

        const count = await User.countDocuments({ role: 'student' });
        console.log(`COUNT:${count}`);
        fs.writeFileSync('count.txt', `COUNT:${count}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        fs.writeFileSync('count.txt', `ERROR:${err.message}`);
        process.exit(1);
    }
};

run();
