const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    image_path: {
        type: String,
        required: true
    },
    image_type: {
        type: String,
        required: true
    }
});

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        product_images: {
            type: [productImageSchema],
            required: true
        },
        product_price: {
            type: Number,
            required: true
        },
        product_type: {
            type: String,
            required: true
        }
    }
);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
