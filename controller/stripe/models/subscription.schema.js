const mongoose = require("mongoose");
const subscriptionsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
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
            enum: ['construction', 'disaster-relief', 'farm-orchard-winery', 'personal-or-business', 'event', 'recreational-site']
        },
        subscription: {
            type: String,
            required: true,
        },
        subscription: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        },
        qrCode: {
            type: String,
            required: false,
        }
    },
    { timestamps: true }
);
const Payment = mongoose.model("Subscription", subscriptionsSchema);

module.exports = Payment;
