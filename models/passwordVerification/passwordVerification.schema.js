const mongoose = require('mongoose');

const passwordVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['verified', 'pending', 'expired'],
            default: 'pending'
        },
        otp: {
            type: String,
            required: true
        },
        expiryOn: {
            type: Date
        }
    },
    { timestamps: true }
);

const PasswordVerification = mongoose.model('PasswordVerification', passwordVerificationSchema);

module.exports = PasswordVerification;
