const express = require('express'); // Import module express
const router = express.Router();
const { Product, Category, Tag } = require('../models');
const { Op } = require('sequelize');
const validationErrorHandler = require('../middlewares/validationErrorHandler');
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');
const {
    createProductValidatorRules,
    updateProductValidatorRules,
    commonIdValidatorRules
} = require('../validators/productValidator');
const {
    getAllProducts,
    getProductById,
    createProduct,
    getRelatedProductsBySlug,
    getProductBySlug,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

router.use(express.json()); // Middleware để phân tích JSON body

const productIncludeOptions = [
    { model: Category, as: 'category' },
    { model: Tag, as: 'tags' }
];


// Lấy danh sách sản phẩm, hỗ trợ lọc theo query string
router.get('/products', getAllProducts);

// // Lấy chi tiết sản phẩm theo ID
// router.get('/products/:id', commonIdValidatorRules(), validationErrorHandler, getProductById);

// Lấy sản phẩm theo slug
router.get('/products/slug/:slug', getProductBySlug);

// Lấy danh sách sản phẩm liên quan theo slug
router.get('/products/related/:slug', getRelatedProductsBySlug);

// Tạo sản phẩm mới
router.post(
    '/products',
    authenticateToken,
    authorizeRole('admin'),
    createProductValidatorRules(),
    validationErrorHandler,
    createProduct
);

// Cập nhật sản phẩm theo ID
router.put(
    '/products/:id',
    authenticateToken,
    authorizeRole('admin'),
    commonIdValidatorRules(),
    updateProductValidatorRules(),
    validationErrorHandler,
    updateProduct
);

// Xóa sản phẩm theo ID
router.delete(
    '/products/:id',
    authenticateToken,
    authorizeRole('admin'),
    commonIdValidatorRules(),
    validationErrorHandler,
    deleteProduct
);

module.exports = router;