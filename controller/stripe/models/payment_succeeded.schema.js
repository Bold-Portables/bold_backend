const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema(
    {
        subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subscription",
            required: true,
        },
        payment: {
            type: Object,
            required: false,
        },
    },
    { timestamps: true }
);
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
