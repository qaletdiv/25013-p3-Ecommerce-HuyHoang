const { Op } = require('sequelize');
const { Order, OrderItem, Variant, Product, DiscountAmount, sequelize } = require('../models');

const SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;
const STATUS_ORDER = ['pending', 'confirmed', 'shipping', 'delivering', 'completed'];

const getDiscount = async (code, transaction) => {
    if (!code) return null;
    const discount = await DiscountAmount.findOne({
        where: {
            code: String(code).trim().toUpperCase(),
            active: true,
            [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }]
        },
        transaction
    });
    if (!discount) {
        const error = new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        error.status = 400;
        throw error;
    }
    return discount;
};

const calculateQuote = async (items, discountCode) => {
    if (!Array.isArray(items) || items.length === 0) {
        const error = new Error('Giỏ hàng đang trống');
        error.status = 400;
        throw error;
    }
    const requestedItems = Array.from(items.reduce((result, item) => {
        const variantId = Number(item.variantId);
        const quantity = Number(item.quantity);
        result.set(variantId, (result.get(variantId) || 0) + quantity);
        return result;
    }, new Map()), ([variantId, quantity]) => ({ variantId, quantity }));
    if (requestedItems.some((item) => !Number.isInteger(item.variantId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
        const error = new Error('Sản phẩm trong giỏ hàng không hợp lệ');
        error.status = 400;
        throw error;
    }

    const variants = await Variant.findAll({
        where: { id: requestedItems.map((item) => item.variantId) },
        attributes: ['id', 'price', 'stock']
    });
    const variantById = new Map(variants.map((variant) => [variant.id, variant]));
    let subtotal = 0;
    for (const requested of requestedItems) {
        const variant = variantById.get(requested.variantId);
        if (!variant || variant.stock < requested.quantity) {
            const error = new Error('Sản phẩm không đủ tồn kho hoặc không còn tồn tại');
            error.status = 409;
            throw error;
        }
        subtotal += variant.price * requested.quantity;
    }
    const discount = await getDiscount(discountCode);
    const discountPercent = discount?.percentage || 0;
    const discountValue = Math.min(
        subtotal,
        Math.floor(subtotal * discountPercent / 100) + (discount?.amount || 0)
    );
    const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
        subtotal,
        discountCode: discount?.code || null,
        discountPercent,
        discountAmount: discountValue,
        shippingFee,
        total: Math.max(0, subtotal - discountValue + shippingFee)
    };
};

exports.getOrderQuote = async (req, res, next) => {
    try {
        return res.json(await calculateQuote(req.body.items, req.body.discountCode));
    } catch (error) {
        return next(error);
    }
};

const buildOrder = async ({ userId, items, shipping, paymentMethod, paymentStatus, discountCode, stripeSessionId }, transaction) => {
    if (!Array.isArray(items) || items.length === 0) {
        const error = new Error('Giỏ hàng đang trống');
        error.status = 400;
        throw error;
    }
    if (!shipping?.name?.trim() || !shipping?.phone?.trim() || !shipping?.address?.trim()) {
        const error = new Error('Thiếu thông tin giao hàng');
        error.status = 400;
        throw error;
    }

    const requestedItems = Array.from(items.reduce((result, item) => {
        const variantId = Number(item.variantId);
        const quantity = Number(item.quantity);
        result.set(variantId, (result.get(variantId) || 0) + quantity);
        return result;
    }, new Map()), ([variantId, quantity]) => ({ variantId, quantity }));
    if (requestedItems.some((item) => !Number.isInteger(item.variantId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
        const error = new Error('Sản phẩm trong giỏ hàng không hợp lệ');
        error.status = 400;
        throw error;
    }

    const variants = await Variant.findAll({
        where: { id: requestedItems.map((item) => item.variantId) },
        include: [{ model: Product, as: 'product', attributes: ['name', 'thumbnail'] }],
        transaction,
        lock: true
    });
    const variantById = new Map(variants.map((variant) => [variant.id, variant]));
    const orderItems = [];

    for (const requested of requestedItems) {
        const variant = variantById.get(requested.variantId);
        if (!variant || variant.stock < requested.quantity) {
            const error = new Error('Sản phẩm không đủ tồn kho hoặc không còn tồn tại');
            error.status = 409;
            throw error;
        }
        orderItems.push({
            variant,
            quantity: requested.quantity,
            productName: variant.product?.name || 'Sản phẩm HyperLane',
            unitPrice: variant.price,
            lineTotal: variant.price * requested.quantity
        });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = await getDiscount(discountCode, transaction);
    const discountPercent = discount?.percentage || 0;
    const percentageDiscount = Math.floor(subtotal * discountPercent / 100);
    const fixedDiscount = discount?.amount || 0;
    const discountValue = Math.min(subtotal, percentageDiscount + fixedDiscount);
    const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = Math.max(0, subtotal - discountValue + shippingFee);

    const order = await Order.create({
        userId,
        status: 'pending',
        paymentMethod,
        paymentStatus,
        subtotal,
        discountId: discount?.id || null,
        discountCode: discount?.code || null,
        discountPercent,
        discountAmount: discountValue,
        shippingFee,
        total,
        shippingName: shipping.name.trim(),
        shippingPhone: shipping.phone.trim(),
        shippingAddress: shipping.address.trim(),
        stripeSessionId: stripeSessionId || null
    }, { transaction });

    await OrderItem.bulkCreate(orderItems.map((item) => ({
        orderId: order.id,
        variantId: item.variant.id,
        productName: item.productName,
        thumbnail: item.variant.product?.thumbnail || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal
    })), { transaction });

    for (const item of orderItems) {
        await item.variant.decrement('stock', { by: item.quantity, transaction });
    }

    return order;
};

exports.createCodOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await buildOrder({
            userId: req.user.id,
            items: req.body.items,
            shipping: req.body.shipping,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            discountCode: req.body.discountCode
        }, transaction);
        await transaction.commit();
        return res.status(201).json({ orderId: order.id, status: order.status, total: order.total });
    } catch (error) {
        await transaction.rollback();
        return next(error);
    }
};

exports.listMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        return res.json(orders);
    } catch (error) {
        return next(error);
    }
};

exports.listAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        return res.json(orders);
    } catch (error) {
        return next(error);
    }
};

exports.cancelMyOrder = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: OrderItem, as: 'items' }],
            transaction,
            lock: true
        });
        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
        if (!['pending', 'confirmed'].includes(order.status)) {
            await transaction.rollback();
            return res.status(409).json({ message: 'Chỉ được hủy đơn khi đang chờ xác nhận hoặc đã xác nhận' });
        }
        for (const item of order.items) {
            await Variant.increment('stock', { by: item.quantity, where: { id: item.variantId }, transaction });
        }
        await order.update({ status: 'cancelled', cancelledAt: new Date(), cancelReason: req.body.reason || null }, { transaction });
        await transaction.commit();
        return res.json({ message: 'Đã hủy đơn hàng', status: order.status });
    } catch (error) {
        await transaction.rollback();
        return next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const nextStatus = req.body.status;
        if (!STATUS_ORDER.includes(nextStatus)) return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ' });
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        if (order.status === 'cancelled' || STATUS_ORDER.indexOf(nextStatus) <= STATUS_ORDER.indexOf(order.status)) {
            return res.status(409).json({ message: 'Trạng thái đơn hàng chỉ được chuyển tiếp, không được chuyển lùi' });
        }
        await order.update({ status: nextStatus, ...(nextStatus === 'completed' ? { paymentStatus: 'paid' } : {}) });
        return res.json({ order });
    } catch (error) {
        return next(error);
    }
};

exports.getRevenue = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            where: { status: 'completed', paymentStatus: 'paid' },
            attributes: ['total', 'createdAt'],
            order: [['createdAt', 'ASC']]
        });
        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const byMonth = {};
        orders.forEach((order) => {
            const month = new Date(order.createdAt).toISOString().slice(0, 7);
            byMonth[month] = (byMonth[month] || 0) + order.total;
        });
        return res.json({ revenue, byMonth });
    } catch (error) {
        return next(error);
    }
};

exports.buildOrder = buildOrder;
