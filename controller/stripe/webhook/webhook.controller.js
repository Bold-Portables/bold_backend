const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;
const apiResponse = require("../../../helpers/apiResponse");
const { endSubscription } = require("./end_subscription.controller");
const { paymentSucceeded } = require("./payment_succeedes.controller");

exports.subscription = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            endpointSecret
        );
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }

    const {
        type,
        data: { object },
    } = event;

    try {
        switch (type) {
            case "invoice.payment_succeeded":
                await paymentSucceeded(object);
            break;

            case "checkout.session.completed":
                await endSubscription(object);
            break;
        }
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }

    return apiResponse.successResponseWithData(
        res,
        "Stipe webhook successfully"
    );
};
