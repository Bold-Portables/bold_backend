const { body } = require("express-validator");

const createStripeCheckoutValidation = () => {
    return [
        body("price")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("price cannot be empty")
            .isNumeric()
            .withMessage("price should be numeric"),
        body("shipping_amount")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("shipping_amount cannot be empty")
            .isNumeric()
            .withMessage("shipping_amount should be number"),
        body("product_name")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("product_name id cannot be empty"),
        body("product_description")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("product_description id cannot be empty"),
        body("interval")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("interval id cannot be empty")
            .isIn(['month', 'day', 'year'])
            .withMessage("interval allowed values are 'month', 'day', 'year'")
    ];
};

const endStripeCustomerValidation = () => {
    return [
        body("subscriptionID")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("Subscription id cannot be empty"),
        body("pickup_charge")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("pickup_charge cannot be empty")
            .isNumeric()
            .withMessage("pickup_charge should be number"),
        body("product_name")
            .trim()
            .escape()
            .not()
            .isEmpty()
            .withMessage("product_name id cannot be empty"),
    ];
};

module.exports = {
    createStripeCheckoutValidation,
    endStripeCustomerValidation,
};
