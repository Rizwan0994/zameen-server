const express = require('express');
const router =express.Router();
const userController = require('../controllers/userController')
//const protect =require('../middlewares/authMiddleware')

router.post('/login',userController.loginUser)
router.post('/loginWithGoogle',userController.loginwithGoogle)
router.post('/register',userController.registerUser)
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resendOtp', userController.resendOtp);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/resetPassword', userController.resetPassword);
// router.post('/logout',userController.logoutUser)
router.route('/profile').get(userController.getUserProfile).put(userController.updateUserProfile).delete(userController.deleteUserProfile)



module.exports = router;