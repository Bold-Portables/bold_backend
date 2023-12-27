const mongoose = require('mongoose');

const phoneOtpVerification = new mongoose.Schema(
    {
        phone: {
            type: String,
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

const PhoneOtpVerification = mongoose.model('PhoneOtpVerification', phoneOtpVerification);

module.exports = PhoneOtpVerification;
