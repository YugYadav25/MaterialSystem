const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to verify token and admin role
const adminAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        req.user = decoded.user;

        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// GET /api/admin/users - List all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).select('-password').sort({ email: 1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/admin/users/:id - Get specific user
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/admin/users/:id - Update user materials
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { materials } = req.body;

        // Basic validation
        if (!materials || !Array.isArray(materials) || materials.length !== 15) {
            return res.status(400).json({ message: 'Must provide exactly 15 materials.' });
        }

        // Check for empty strings
        if (materials.some(m => !m || m.trim() === '')) {
            return res.status(400).json({ message: 'All materials must be filled.' });
        }

        const normalizedMaterials = materials.map(m => m.trim());
        const uniqueSet = new Set(normalizedMaterials.map(m => m.toLowerCase()));
        if (uniqueSet.size !== 15) {
            return res.status(400).json({ message: 'Duplicate materials in list.' });
        }

        // Global Uniqueness Check (External)
        // Check against all users EXCEPT the one being updated
        const existingUsers = await User.find({
            _id: { $ne: req.params.id }, // Exclude current user
            materials: {
                $in: normalizedMaterials.map(m => new RegExp(`^${m}$`, 'i'))
            }
        });

        if (existingUsers.length > 0) {
            const duplicates = [];
            for (const newUserMat of normalizedMaterials) {
                for (const existingUser of existingUsers) {
                    if (existingUser.materials.some(dbMat => dbMat.toLowerCase() === newUserMat.toLowerCase())) {
                        duplicates.push(newUserMat);
                        break;
                    }
                }
            }
            if (duplicates.length > 0) {
                return res.status(400).json({
                    message: `Conflict! These materials are already claimed by others: ${duplicates.join(', ')}`
                });
            }
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.materials = normalizedMaterials;
        user.hasSubmitted = true; // Ensure it's marked as submitted if admin edits it
        await user.save();

        res.json({ message: 'User updated successfully', materials: user.materials });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/admin/upload-materials
// Upload and process Excel file for bulk material updates
const multer = require('multer');
const xlsx = require('xlsx');

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
            cb(null, true);
        } else {
            cb(new Error("Please upload only excel file."), false);
        }
    }
});

router.post('/upload-materials', adminAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        // Parse buffer with xlsx
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON (array of arrays or objects)
        // Assume Header: Email, Material 1, Material 2 ...
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Header: 1 gives array of arrays

        if (jsonData.length < 2) {
            return res.status(400).json({ message: "File appears empty or missing header." });
        }

        // Rows starting from index 1 (skip header index 0)
        let successCount = 0;
        let errors = [];

        // We process sequentially to handle potential uniqueness checks if needed, 
        // though bulk processing implies trust in the admin's file.
        // For safety, we will still validate simple constraints.

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            // Expecting: [Email, M1, M2, ... M15]
            // Email is at row[0]
            const email = row[0];

            if (!email) continue; // Skip empty rows

            // Materials are from index 1 to 15
            const materials = row.slice(1, 16).map(m => m ? String(m).trim() : "");

            // Check if we have 15 materials
            if (materials.length < 15) {
                // Pad with empty strings if missing, but better to flag error?
                // Let's assume we proceed but maybe flag if critical
                while (materials.length < 15) materials.push("");
            }

            // Find user by email
            const user = await User.findOne({ email: email });
            if (!user) {
                errors.push(`Row ${i + 1}: User with email ${email} not found.`);
                continue;
            }

            // Update user
            user.materials = materials;

            // Check if they are valid (non-empty) to mark submitted?
            // If admin uploads empty strings, we respect that.
            // If at least one material is present, we can say submitted = true? 
            // Or only if ALL 15 present? Implementation plan said "15 materials".
            // Let's check for non-empty.
            const nonEmptyCount = materials.filter(m => m !== "").length;

            if (nonEmptyCount === 15) {
                user.hasSubmitted = true;
            }
            // If admin uploads partial, we might not set hasSubmitted=true, but we still save data.

            await user.save();
            successCount++;
        }

        res.json({
            message: `Processed ${jsonData.length - 1} rows. Updated ${successCount} users.`,
            errors: errors
        });

    } catch (err) {
        console.error("Excel Upload Error:", err);
        res.status(500).json({ message: "Server Error during processing." });
    }
});

// GET /api/admin/download-excel
// Download all student data as Excel
router.get('/download-excel', adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).sort({ email: 1 });

        const data = users.map(user => {
            const row = {
                'Student Name': user.name,
                'Email ID': user.email,
                'Status': user.hasSubmitted ? 'Submitted' : 'Pending'
            };

            // Add materials 1-15
            const userMaterials = user.materials || [];
            for (let i = 0; i < 15; i++) {
                row[`Material ${i + 1}`] = userMaterials[i] || '';
            }

            return row;
        });

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 20 }, // Name
            { wch: 30 }, // Email
            { wch: 10 }, // Status
        ];
        worksheet['!cols'] = wscols;

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Students Data');

        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        console.log(`Generating Excel for ${users.length} students. Size: ${buffer.length} bytes`);

        res.setHeader('Content-Disposition', 'attachment; filename="Student_Data_Export.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', buffer.length);

        // Use res.send for buffer
        res.send(buffer);

    } catch (err) {
        console.error("Excel Download Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Server Error during Excel generation." });
        }
    }
});

module.exports = router;
