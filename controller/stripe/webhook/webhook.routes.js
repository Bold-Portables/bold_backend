const express = require("express");
const router = express.Router();
const webhookController = require("./webhook.controller");

router.post(
    "/subscription",
    express.raw({ type: "application/json" }),
    webhookController.subscription
);

module.exports = router;
