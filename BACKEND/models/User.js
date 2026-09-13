// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        default: 'Customer' // Defaults to Customer if they are a new user signing in via OTP
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    // Temporary fields for the OTP flow
    otp: { 
        type: String 
    },
    otpExpires: { 
        type: Date 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);