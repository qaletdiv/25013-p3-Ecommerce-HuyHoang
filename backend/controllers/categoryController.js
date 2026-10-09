const { Category, Product } = require('../models');

const getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            include: [{ model: Product, as: 'products' }]
        });
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [{ model: Product, as: 'products' }]
        });
        if (!category) {
            return res.status(404).send('Không tìm thấy danh mục');
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
};

const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const newCategory = await Category.create({ name, description });
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(409).json({
                message: 'Tên danh mục đã tồn tại',
                param: 'name',
                location: 'body'
            });
        }
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const [updatedRows] = await Category.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).send('Không tìm thấy danh mục để cập nhật');
        }

        const updatedCategory = await Category.findByPk(req.params.id);
        res.json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const deletedRows = await Category.destroy({
            where: { id: req.params.id }
        });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Ko tìm thấy danh mục để xóa' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
