const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        profile_picture: {
            type: String,
            required: false
        },
        mobile: {
            type: String,
            required: true
        },
        mobile_verified:{
            type: Boolean,
            default:false
        },
        registrationOTP: {
            type: String
        },
        password: {
            type: String,
            required: true
            // select: false   Will look into this how to handle this
        },
        user_type: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER'
        },
        privacy_acceptance: {
            type: Boolean,
            required: false
        },
        stripe_customer_id: {
            type: String,
            required: false
        },
        address: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
