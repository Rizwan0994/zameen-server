const express = require('express');
const router =express.Router();

const paymentController = require('../controllers/paymentController');

router.post('/createStripeSession',paymentController.createStripeSession)

module.exports = router;