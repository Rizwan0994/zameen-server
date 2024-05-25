// index.js
const express = require('express');
const router = express.Router();
const userRoutes = require("../routes/userRoutes")
const propertyRoutes = require("../routes/propertyRoutes")
router.use('/api/auth/user', userRoutes);
router.use('/api/property', propertyRoutes);
router.get('/api', function (req, res) {
   res.send('Hello, ZameenVisit Server =>  this is the main route!');

});

module.exports = router;
