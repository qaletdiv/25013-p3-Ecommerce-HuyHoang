const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const handleValidationErrors = require('../middlewares/validationErrorHandler');
const {
    registerValidationRules,
    loginValidationRules,
    updateProfileValidationRules
} = require('../validators/authValidator');
const authenticateToken = require('../middlewares/authenticateToken');
const { uploadSingleImage } = require('../middlewares/uploadMiddleware');
const imageProcessingMiddleware = require('../middlewares/imageProcessingMiddleware');

// Chức năng đăng ký người dùng mới
router.post('/register', registerValidationRules(), handleValidationErrors, authController.register);

// Chức năng đăng nhập
router.post('/login', loginValidationRules(), handleValidationErrors, authController.login);

// Chức năng đăng xuất
router.post('/logout',
    authenticateToken,
    authController.logout);

//
router.get('/me',
    authenticateToken,
    authController.getMe);

router.patch('/me',
    authenticateToken,
    updateProfileValidationRules(),
    handleValidationErrors,
    authController.updateMe);

router.patch('/change-password',
    authenticateToken,
    authController.changePassword);


router.patch('/update-my-avatar',
    authenticateToken,
    uploadSingleImage('avatar'),
    imageProcessingMiddleware.resizeImage,
    authController.updateMyAvatar);


module.exports = router;