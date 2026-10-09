const { body } = require('express-validator');
// Đăng ký người dùng mới
const registerValidationRules = () => {
    return [
    body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    ]
};

const loginValidationRules = () => {
    return [
        body('emailOrUsername')
            .notEmpty().withMessage('Email or username is required'),
        body('password')
            .notEmpty().withMessage('Password is required')
    ];
};

const updateProfileValidationRules = () => {
    return [
        body('username')
            .optional()
            .trim()
            .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
        body('email')
            .optional()
            .trim()
            .isEmail().withMessage('Invalid email format'),
        body('currentPassword')
            .optional()
            .isString().withMessage('Current password must be a string'),
        body('newPassword')
            .optional()
            .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
            .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter')
            .matches(/[0-9]/).withMessage('New password must contain a number')
    ];
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
    updateProfileValidationRules
};