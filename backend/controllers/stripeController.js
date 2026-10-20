const Stripe = require('stripe');
const { Product, Variant, Order, DiscountAmount, sequelize } = require('../models');
const { buildOrder } = require('./orderController');

const getStripeClient = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey || secretKey.includes('replace_with_your_secret_key')) {
        const error = new Error('STRIPE_SECRET_KEY chưa được cấu hình bằng Stripe secret key thật trên backend');
        error.status = 503;
        throw error;
    }
    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        const error = new Error('STRIPE_SECRET_KEY không hợp lệ');
        error.status = 503;
        throw error;
    }
    return new Stripe(secretKey);
};

exports.createCheckoutSession = async (req, res, next) => {
    try {
        const { items, shipping, discountCode } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng đang trống' });
        }
        if (!shipping?.name || !shipping?.phone || !shipping?.address) {
            return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });
        }

        const requestedItems = Array.from(items.reduce((result, item) => {
            const variantId = Number(item.variantId);
            const quantity = Number(item.quantity);
            result.set(variantId, (result.get(variantId) || 0) + quantity);
            return result;
        }, new Map()), ([variantId, quantity]) => ({ variantId, quantity }));
        if (requestedItems.some((item) => !Number.isInteger(item.variantId) || !Number.isInteger(item.quantity) || item.quantity < 1)) {
            return res.status(400).json({ message: 'Sản phẩm trong giỏ hàng không hợp lệ' });
        }

        const variants = await Variant.findAll({
            where: { id: requestedItems.map((item) => item.variantId) },
            include: [{ model: Product, as: 'product', attributes: ['name'] }]
        });
        const variantById = new Map(variants.map((variant) => [variant.id, variant]));
        const lineItems = [];
        let subtotal = 0;

        for (const requested of requestedItems) {
            const variant = variantById.get(requested.variantId);
            if (!variant || variant.stock < requested.quantity) {
                return res.status(409).json({ message: 'Sản phẩm không đủ tồn kho hoặc không còn tồn tại' });
            }
            lineItems.push({
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: variant.product?.name || 'Sản phẩm HyperLane'
                    },
                    unit_amount: variant.price
                },
                quantity: requested.quantity
            });
            subtotal += variant.price * requested.quantity;
        }

        const discount = discountCode
            ? await DiscountAmount.findOne({ where: { code: String(discountCode).trim().toUpperCase(), active: true } })
            : null;
        if (discountCode && !discount) {
            return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
        }
        const discountValue = discount
            ? Math.min(subtotal, Math.floor(subtotal * discount.percentage / 100) + discount.amount)
            : 0;
        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        if (shippingFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'vnd',
                    product_data: { name: 'Phí vận chuyển' },
                    unit_amount: shippingFee
                },
                quantity: 1
            });
        }

        const appUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
        const stripe = getStripeClient();
        let coupon;
        if (discount?.percentage) {
            coupon = await stripe.coupons.create({ percent_off: discount.percentage, duration: 'once' });
        } else if (discount?.amount) {
            coupon = await stripe.coupons.create({ amount_off: discount.amount, currency: 'vnd', duration: 'once' });
        }
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            ...(coupon ? { discounts: [{ coupon: coupon.id }] } : {}),
            customer_email: req.user.email,
            success_url: `${appUrl}/confirm-checkout?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/checkout?payment_cancelled=1`,
            metadata: {
                userId: String(req.user.id),
                shippingName: shipping.name.trim(),
                shippingPhone: shipping.phone.trim(),
                shippingAddress: shipping.address.trim(),
                discountCode: discountCode ? String(discountCode).trim().toUpperCase() : '',
                items: JSON.stringify(requestedItems)
            }
        });

        return res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        if (error.type === 'StripeAuthenticationError') {
            return res.status(503).json({ message: 'Stripe secret key không hợp lệ hoặc đã bị từ chối' });
        }
        return next(error);
    }
};

exports.confirmCheckoutSession = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const stripe = getStripeClient();
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        if (!session || session.metadata?.userId !== String(req.user.id)) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Phiên thanh toán không thuộc tài khoản này' });
        }
        if (session.payment_status !== 'paid') {
            await transaction.rollback();
            return res.status(402).json({ message: 'Thanh toán Stripe chưa thành công' });
        }

        const existingOrder = await Order.findOne({ where: { stripeSessionId: session.id }, transaction });
        if (existingOrder) {
            const items = await existingOrder.getItems({
                transaction,
                include: [{ model: require('../models').Variant, as: 'variant', include: [{ model: require('../models').Product, as: 'product', attributes: ['thumbnail'] }] }]
            });
            await transaction.commit();
            return res.json({ orderId: existingOrder.id, status: existingOrder.status, total: existingOrder.total, items });
        }

        const items = JSON.parse(session.metadata.items || '[]');
        const order = await buildOrder({
            userId: req.user.id,
            items,
            shipping: {
                name: session.metadata.shippingName,
                phone: session.metadata.shippingPhone,
                address: session.metadata.shippingAddress
            },
            paymentMethod: 'stripe',
            paymentStatus: 'paid',
            discountCode: session.metadata.discountCode,
            stripeSessionId: session.id
        }, transaction);

        await transaction.commit();
        const savedItems = await Order.findByPk(order.id, {
            include: [{
                model: require('../models').OrderItem,
                as: 'items',
                include: [{ model: require('../models').Variant, as: 'variant', include: [{ model: require('../models').Product, as: 'product', attributes: ['thumbnail'] }] }]
            }]
        });
        return res.status(201).json({ orderId: order.id, status: order.status, total: order.total, items: savedItems.items });
    } catch (error) {
        await transaction.rollback();
        return next(error);
    }
};

exports.handleWebhook = async (req, res, next) => {
    let event;
    try {
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers['stripe-signature'],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).json({ message: `Webhook không hợp lệ: ${error.message}` });
    }

    if (event.type !== 'checkout.session.completed') {
        return res.json({ received: true });
    }

    const session = event.data.object;
    if (session.payment_status !== 'paid' || !session.metadata?.userId) {
        return res.json({ received: true });
    }

    const transaction = await sequelize.transaction();
    try {
        const existingOrder = await Order.findOne({ where: { stripeSessionId: session.id }, transaction });
        if (!existingOrder) {
            await buildOrder({
                userId: Number(session.metadata.userId),
                items: JSON.parse(session.metadata.items || '[]'),
                shipping: {
                    name: session.metadata.shippingName,
                    phone: session.metadata.shippingPhone,
                    address: session.metadata.shippingAddress
                },
                paymentMethod: 'stripe',
                paymentStatus: 'paid',
                discountCode: session.metadata.discountCode,
                stripeSessionId: session.id
            }, transaction);
        }
        await transaction.commit();
        return res.json({ received: true });
    } catch (error) {
        await transaction.rollback();
        return next(error);
    }
};
