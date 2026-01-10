const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret'); // Use strict env in prod
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// GET /api/materials - Get current user's materials
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            hasSubmitted: user.hasSubmitted,
            materials: user.materials
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/materials - Submit 15 unique materials
router.post('/', auth, async (req, res) => {
    try {
        const { materials } = req.body;

        // 1. Basic Validation
        if (!materials || !Array.isArray(materials) || materials.length !== 15) {
            return res.status(400).json({ message: 'You must submit exactly 15 materials.' });
        }

        // Check for empty strings in submission
        if (materials.some(m => !m || m.trim() === '')) {
            return res.status(400).json({ message: 'All 15 material fields must be filled.' });
        }

        // 2. Normalize inputs (trim and lowercase for comparison)
        const normalizedMaterials = materials.map(m => m.trim());

        // Check for internal duplicates in the submission itself
        const uniqueSet = new Set(normalizedMaterials.map(m => m.toLowerCase()));
        if (uniqueSet.size !== 15) {
            return res.status(400).json({ message: 'Your list contains duplicate materials. Please ensure all 15 are unique.' });
        }

        // 3. Database Uniqueness Check
        // Find ANY user who has ANY of these materials in their list.
        // We use regex for case-insensitive match for robustness

        // Note: For high performance at scale, we would use an aggregation or text index, 
        // but for 120 users, a simple query is fine.

        const duplicates = [];

        // Check sequentially to identify specific duplicates is friendlier than generic error
        // Or checking all at once:
        const existingUsers = await User.find({
            materials: {
                $in: normalizedMaterials.map(m => new RegExp(`^${m}$`, 'i'))
            }
        });

        if (existingUsers.length > 0) {
            // Extract which materials caused the conflict
            // This is O(N*M) but N=tiny (users found) and M=15.
            for (const newUserMat of normalizedMaterials) {
                for (const existingUser of existingUsers) {
                    // Skip checking against self if re-submitting (though hasSubmitted should block this)
                    if (existingUser._id.toString() === req.user.id) continue;

                    if (existingUser.materials.some(dbMat => dbMat.toLowerCase() === newUserMat.toLowerCase())) {
                        duplicates.push(newUserMat);
                        break; // Found a match for this material, move to next
                    }
                }
            }
        }

        if (duplicates.length > 0) {
            return res.status(400).json({
                message: `The following materials are already claimed by other students: ${duplicates.join(', ')}`,
                duplicates
            });
        }

        // 4. Save to User
        const user = await User.findById(req.user.id);

        if (user.hasSubmitted) {
            return res.status(400).json({ message: 'You have already submitted your materials.' });
        }

        user.materials = normalizedMaterials;
        user.hasSubmitted = true;
        await user.save();

        res.json({ message: 'Materials submitted successfully!', materials: user.materials });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
