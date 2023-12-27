const mongoose = require('mongoose');

const userServicesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        service: {
            type: String,
            required: true
        },
        serviceTypes: {
            type: Array,
            required: true,
        },
        quotationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'quotationType'
        },
        quotationType: {
            type: String,
            required: true,
            enum: ['construction', 'disaster-relief', 'personal-or-business', 'farm-orchard-winery', 'event', 'recreational-site']
        },
        qrId: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'resolved'],
            default: 'pending'
        },
        images: {
            type: Array,
            validate: {
                validator: function (value) {
                    return value.length <= 3;
                },
                message: 'Maximum of 3 images allowed.'
            }
        }
    },
    {
        timestamps: true
    }
);

const UserServices = mongoose.model('UserServices', userServicesSchema);

module.exports = UserServices;
