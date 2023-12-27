const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        status_seen: {
            type: Boolean,
            default: false
        },
        quote_type: {
            type: String,
            default: null
        },
        quote_id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'quote_type'
        },
        type: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
