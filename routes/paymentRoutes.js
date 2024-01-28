const express = require("express");
const {
  processPayment,
  sendStripeApiKey,
} = require("../controllers/paymentControllers");
const router = express.Router();
const { isAuthenticatedError } = require("../middleware/auth");

router.route("/payment/process").post(isAuthenticatedError, processPayment);

router.route("/stripeapikey").get(isAuthenticatedError, sendStripeApiKey);

module.exports = router;
