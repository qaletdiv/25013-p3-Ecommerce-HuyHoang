const { body, param } = require('express-validator');

const createCategoryValidatorRules = () => {
    return [
        body('name')
            .notEmpty().withMessage('Tên danh mục không được để trống')
            .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự')
            .trim(),
        body('description')
            .optional()
            .isLength({ max: 500 }).withMessage('Mô tả danh mục không được vượt quá 500 ký tự')
            .trim()
    ];
}

const updateCategoryValidatorRules = () => {
    return [
        body('name')
            .optional()
            .notEmpty().withMessage('Tên danh mục không được để trống')
            .isLength({ max: 100 }).withMessage('Tên danh mục không được vượt quá 100 ký tự')
            .trim(),
        body('description')
            .optional()
            .isLength({ max: 500 }).withMessage('Mô tả danh mục không được vượt quá 500 ký tự')
            .trim()
    ];
}

const commonIdValidatorRules = () => {
    return [
        param('id')
            .isInt({ gt: 0 }).withMessage('ID danh mục phải là một số nguyên dương')
    ];
}

module.exports = {
    createCategoryValidatorRules,
    updateCategoryValidatorRules,
    commonIdValidatorRules
};
