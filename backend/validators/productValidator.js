const { body, param } = require('express-validator');

const createProductValidatorRules = () => {
    return [
        body('name')
            .notEmpty().withMessage('Tên sản phẩm không được để trống')
            .isLength({ max: 100 }).withMessage('Tên sản phẩm không được vượt quá 100 ký tự')
            .trim(),
        body('description')
            .optional()
            .isLength({ max: 500 }).withMessage('Mô tả sản phẩm không được vượt quá 500 ký tự')
            .trim(),
        body('categoryId')
            .optional()
            .isInt({ gt: 0 }).withMessage('ID danh mục phải là một số nguyên dương'),
        body('tagIds')
            .optional()
            .isArray().withMessage('tagIds phải là một mảng'),
        body('tagIds.*')
            .optional()
            .isInt({ gt: 0 }).withMessage('Mỗi tagId phải là một số nguyên dương')
    ];
};

const updateProductValidatorRules = () => {
    return [
        body('name')
            .optional()
            .notEmpty().withMessage('Tên sản phẩm không được để trống')
            .isLength({ max: 100 }).withMessage('Tên sản phẩm không được vượt quá 100 ký tự')
            .trim(),
        body('description')
            .optional()
            .isLength({ max: 500 }).withMessage('Mô tả sản phẩm không được vượt quá 500 ký tự')
            .trim(),
        body('categoryId')
            .optional()
            .isInt({ gt: 0 }).withMessage('ID danh mục phải là một số nguyên dương'),
        body('tagIds')
            .optional()
            .isArray().withMessage('tagIds phải là một mảng'),
        body('tagIds.*')
            .optional()
            .isInt({ gt: 0 }).withMessage('Mỗi tagId phải là một số nguyên dương')
    ];
};

const commonIdValidatorRules = () => {
    return [
        param('id')
            .isInt({ gt: 0 }).withMessage('ID sản phẩm phải là một số nguyên dương')
    ];
};

module.exports = {
    createProductValidatorRules,
    updateProductValidatorRules,
    commonIdValidatorRules
};
