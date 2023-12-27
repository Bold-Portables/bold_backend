const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema(
    {

        category: {
            type: String,
            default: null,
        }
    },
    { timestamps: true }
);

const serviceCategory = mongoose.model('serviceCategory', serviceCategorySchema);

module.exports = serviceCategory;
