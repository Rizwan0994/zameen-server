// index.js
const express = require('express');
const router = express.Router();
const userRoutes = require("../routes/userRoutes")
const propertyRoutes = require("../routes/propertyRoutes")
const authRoutes = require("../routes/authRoutes")
const contactRoutes = require("../routes/contactRoutes")
const { jwtValidation} = require('../middlewares/authentication');
const userController = require('../controllers/propertyController');
router.use('/api/auth', authRoutes);


router.get('/api/property/getAllProperties',userController.getAllProperties)
router.get('/api/property/searchProperties',userController.searchProperties)
router.get('/api/property/getLatestProperties',userController.getLatestProperties)
router.use('/api/contact', contactRoutes);
router.use(jwtValidation);
router.use('/api/user', userRoutes);
router.use('/api/property', propertyRoutes);

router.get('/api', function (req, res) {
   res.send('Hello, ZameenVisit Server =>  this is the main api route!');

});

module.exports = router;
