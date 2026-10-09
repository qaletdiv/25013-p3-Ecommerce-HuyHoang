const express = require('express'); // Import module express
const router = express.Router();
const { Category, Product } = require('../models');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const {
    createCategoryValidatorRules,
    updateCategoryValidatorRules,
    commonIdValidatorRules
} = require('../validators/categoryValidator');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

router.get('/', getAllCategories);

router.get('/:id', commonIdValidatorRules(), validationErrorHandler, getCategoryById);

// POST - Thêm danh mục mới
router.post(
    '/',
    authenticateToken,
    authorizeRole('admin'),
    createCategoryValidatorRules(),
    validationErrorHandler,
    createCategory
);

// PUT/PATCH - Cập nhật danh mục theo ID
router.put(
    '/:id',
    authenticateToken,
    authorizeRole('admin'),
    commonIdValidatorRules(),
    updateCategoryValidatorRules(),
    validationErrorHandler,
    updateCategory
);

// DELETE - Xóa danh mục theo ID
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('admin'),
    commonIdValidatorRules(),
    validationErrorHandler,
    deleteCategory
);

module.exports = router