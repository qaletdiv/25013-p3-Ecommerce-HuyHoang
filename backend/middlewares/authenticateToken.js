const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
    // Kiểm tra session trước
    if (req.session && req.session.userId) {
        try {
            const user = await User.findByPk(req.session.userId);
            if (!user) {
                return res.status(404).json({ message: 'Xác thực thất bại' });
            }
            req.user = user;
            return next();
        } catch (error) {
            console.error('Lỗi khi xác thực người dùng:', error);
            return next(error);
        }
    }

    // Nếu không có session, kiểm tra JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;

    jwt.verify(token, jwtSecret, async (err, decoded) => {
        if (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(403).json({ message: 'Access token has expired' });
            }
            return res.status(403).json({ message: 'Invalid access token' });
        }

        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return res.status(403).json({ message: 'Token không hợp lệ, Thiếu thông tin người dùng' });
        }

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Xác thực thất bại' });
            }
            req.user = user;
            next();
        } catch (error) {
            console.error('Lỗi khi xác thực người dùng:', error);
            next(error);
        }
    });
};

module.exports = authenticateToken;