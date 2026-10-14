const { Product, Category, Variant, Size, Color, sequelize } = require('../models');

const productIncludeOptions = [
    {
        model: Category,
        as: 'category'
    },
    {
        model: Variant,
        as: 'variants',
        include: [
            {
                model: Size,
                as: 'size'
            },
            {
                model: Color,
                as: 'color'
            }
        ]
    }
];

const syncVariants = async (product, variants, transaction) => {
    if (!Array.isArray(variants)) return;

    const submittedIds = [];
    for (const item of variants) {
        const sizeName = typeof item.size === 'object' ? item.size?.name : item.size;
        const colorName = typeof item.color === 'object' ? item.color?.name : item.color;
        if (!sizeName || !colorName || !Number.isFinite(Number(item.price))) {
            throw new Error('Mỗi biến thể phải có size, màu và giá hợp lệ');
        }

        const [size] = await Size.findOrCreate({
            where: { name: String(sizeName).trim() },
            defaults: { name: String(sizeName).trim() },
            transaction
        });
        const [color] = await Color.findOrCreate({
            where: { name: String(colorName).trim() },
            defaults: { name: String(colorName).trim() },
            transaction
        });
        const values = {
            productId: product.id,
            sizeId: size.id,
            colorId: color.id,
            price: Math.max(0, Number(item.price)),
            stock: Math.max(0, Number(item.stock || 0))
        };

        if (item.id) {
            const existing = await Variant.findOne({
                where: { id: item.id, productId: product.id },
                transaction
            });
            if (existing) {
                await existing.update(values, { transaction });
                submittedIds.push(existing.id);
                continue;
            }
        }

        const created = await Variant.create(values, { transaction });
        submittedIds.push(created.id);
    }

    await Variant.destroy({
        where: {
            productId: product.id,
            id: { [require('sequelize').Op.notIn]: submittedIds.length ? submittedIds : [0] }
        },
        transaction
    });
};

const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.findAll({
            where: req.includeHidden ? undefined : { hidden: false },
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            include: productIncludeOptions
        });

        res.json(products);

    } catch (error) {
        next(error);
    }
};

const getProductOptions = async (req, res, next) => {
    try {
        const [sizes, colors] = await Promise.all([
            Size.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] }),
            Color.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] })
        ]);

        res.json({ sizes, colors });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: productIncludeOptions
        });
        if (!product) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

const getRelatedProductsBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            where: { slug: req.params.slug },
            include: productIncludeOptions
        });
        if (!product) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }
        const relatedProducts = await Product.findAll({
            where: {
                categoryId: product.categoryId,
                id: { [require('sequelize').Op.ne]: product.id },
                hidden: false
            },
            include: productIncludeOptions
        });
        res.json(relatedProducts);
    } catch (error) {
        next(error);
    }
};

const getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            where: { slug: req.params.slug, hidden: false },
            include: productIncludeOptions
        });
        if (!product) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }
        res.json(product);
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, slug, description, categoryId, tagIds, thumbnail, images, specs, hot, hidden, variants } = req.body;
        const newProduct = await Product.create(
            { name, slug, description, categoryId, thumbnail, images, specs, hot, hidden: Boolean(hidden) },
            { transaction }
        );

        if (Array.isArray(tagIds) && tagIds.length > 0) {
            await newProduct.setTags(tagIds, { transaction });
        }
        await syncVariants(newProduct, variants, transaction);
        await transaction.commit();

        const createdProduct = await Product.findByPk(newProduct.id, {
            include: productIncludeOptions
        });

        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, slug, description, categoryId, tagIds, thumbnail, images, specs, hot, hidden, variants } = req.body;
        const product = await Product.findByPk(req.params.id, { transaction });

        if (!product) {
            await transaction.rollback();
            return res.status(404).send('Không tìm thấy sản phẩm để cập nhật');
        }

        await product.update(
            { name, slug, description, categoryId, thumbnail, images, specs, hot, hidden },
            { transaction }
        );

        if (Array.isArray(tagIds)) {
            await product.setTags(tagIds, { transaction });
        }
        await syncVariants(product, variants, transaction);
        await transaction.commit();

        const updatedProduct = await Product.findByPk(req.params.id, {
            include: productIncludeOptions
        });
        res.json(updatedProduct);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getProductOptions,
    getProductById,
    createProduct,
    getRelatedProductsBySlug,
    getProductBySlug,
    updateProduct,
};
