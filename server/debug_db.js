require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const xlsx = require('xlsx');

const run = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
        if (!MONGO_URI) {
            console.error("No MONGO_URI found");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        const count = await User.countDocuments({ role: 'student' });
        console.log(`Total Students found in DB: ${count}`);

        const submittedCount = await User.countDocuments({ role: 'student', hasSubmitted: true });
        console.log(`Submitted Students: ${submittedCount}`);

        // Test XLSX generation
        console.log("Testing XLSX generation...");
        const workbook = xlsx.utils.book_new();
        const sheet = xlsx.utils.json_to_sheet([{ Name: "Test", Email: "test@test.com" }]);
        xlsx.utils.book_append_sheet(workbook, sheet, "Test");
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        console.log(`XLSX Buffer generated. Size: ${buffer.length} bytes`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

run();
