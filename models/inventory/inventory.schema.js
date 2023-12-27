const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        category: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 0
        },
        qrId: {
            type: String,
            required: false
        },
        qrCodeValue: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        qrCode: {
            type: String,
            required: false
        },
        quote_id: {
            type: String,
            required: false,
            default: null
        },
        quote_type: {
            type: String,
            required: false,
            default: null
        },
        created_value: {
            type: String,
            required: false,
            default: null
        },
        intial_value: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'modified', 'cancelled'],
            default: 'pending'
        },
    },
    { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
