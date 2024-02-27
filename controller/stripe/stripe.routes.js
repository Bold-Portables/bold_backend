const router = require("express").Router();
const stripeController = require("./stripe.controller");
const subscriptionController = require("./subscription.controller");
const checkAuth = require("../../middleware/checkAuth");
const { hasRole } = require("../../middleware/checkRole");
const { createStripeCheckoutValidation, endStripeCustomerValidation } = require("./stripe.schema");
const { validate } = require("../../validators/validate");

router.post(
    "/create-customer",
    checkAuth,
    hasRole("USER"),
    stripeController.createCustomer
);
router.post(
    "/checkout-session",
    checkAuth,
    hasRole("USER"),
    createStripeCheckoutValidation(),
    validate,
    stripeController.createCheckoutSession
);
router.post(
    "/end-subscription",
    checkAuth,
    hasRole("USER"),
    endStripeCustomerValidation(),
    validate,
    stripeController.endSubscription
);

// History
router.get(
    "/subscription",
    checkAuth,
    stripeController.getSubscriptionList
);
router.get(
    "/subscription/:subscriptionId",
    checkAuth,
    stripeController.getSubscriptionPaymentList
);

router.get(
    "/admin/subscription",
    checkAuth,
    hasRole("ADMIN"),
    stripeController.getSubscriptionListForAdmin
);

router.get(
    "/admin/subscription-detail/:subscriptionId",
    checkAuth,
    hasRole("ADMIN"),
    subscriptionController.getDetails
);

router.post(
    "/admin/subscription-fee/:subscriptionId",
    checkAuth,
    hasRole("ADMIN"),
    subscriptionController.chargeServiceFee
);

module.exports = router;
