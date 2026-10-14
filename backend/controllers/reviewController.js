const { Review } = require('../models');

exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.findAll({
            attributes: ['id', 'userName', 'rating', 'comment', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 30
        });
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

exports.createReview = async (req, res, next) => {
    try {
        const rating = Number(req.body.rating);
        const comment = String(req.body.comment || '').trim();
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Số sao phải từ 1 đến 5' });
        }
        if (comment.length < 5 || comment.length > 500) {
            return res.status(400).json({ message: 'Bình luận phải dài từ 5 đến 500 ký tự' });
        }

        const review = await Review.create({
            userId: req.user.id,
            userName: req.user.name || req.user.username || 'Khách hàng',
            rating,
            comment
        });
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
};
