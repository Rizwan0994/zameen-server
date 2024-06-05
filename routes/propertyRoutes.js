const express = require('express');
const router =express.Router();
const userController = require('../controllers/propertyController');
//const protect =require('../middlewares/authMiddleware')

router.post('/createProperty',userController.createProperty)
router.get('/getProperty/:id',userController.getProperty)
router.get('/getAllProperties',userController.getAllProperties)
router.get('/searchProperties',userController.searchProperties)
router.get('/getUserProperties',userController.getUserProperties)
router.post('/deleteProperty' userController.deleteProperty);

module.exports = router;
