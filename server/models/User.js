const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    // You might want to track if they have submitted materials
    hasSubmitted: {
        type: Boolean,
        default: false
    },
    materials: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
