// index.js
const express = require('express');
const router = express.Router();
const userRoutes = require("../routes/userRoutes")
const propertyRoutes = require("../routes/propertyRoutes")
const authRoutes = require("../routes/authRoutes")
const contactRoutes = require("../routes/contactRoutes")
const { jwtValidation} = require('../middlewares/authentication');
const propertyController = require('../controllers/propertyController');
const userController = require('../controllers/userController');
const productRoutes = require('../routes/productRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const product = require('../models/product');
router.use('/api/auth', authRoutes);


router.get('/api/property/getAllProperties',propertyController.getAllProperties)
router.get('/api/property/searchProperties',propertyController.searchProperties)
router.get('/api/property/getLatestProperties',propertyController.getLatestProperties)
router.get('/api/property/getProperty/:id',propertyController.getProperty)
router.get('/api/property/propertiesFind',propertyController.propertiesFinder)
router.get('/api/agency/getAllAgencies',userController.getAllAgencies)
// router.get('/api/property/getProperty/:id',userController.getProperty)
// router.post('/api/property/promote', userController.promoteProperty);
router.use('/api/contact', contactRoutes);
router.use('/api/payment', paymentRoutes);
router.use(jwtValidation);
router.use('/api/user', userRoutes);
router.use('/api/property', propertyRoutes);
router.use('/api/product',productRoutes);


router.get('/api', function (req, res) {
   res.send('Hello, ZameenVisit Server =>  this is the main api route!');

});

module.exports = router;
