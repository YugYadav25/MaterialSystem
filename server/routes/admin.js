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

module.exports = router;
