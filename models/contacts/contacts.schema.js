const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        company_name: String,
        email: String,
        phone: String,
        message: String,
        feedback: String
    },
    { timestamps: true }
);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
