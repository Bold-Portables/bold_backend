const mongoose = require('mongoose');

const inventoryTypesSchema = new mongoose.Schema(
    {

        types: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

const Inventory_type = mongoose.model('Inventory_type', inventoryTypesSchema);

module.exports = Inventory_type;
