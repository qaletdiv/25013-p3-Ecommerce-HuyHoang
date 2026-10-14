const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

exports.register = async (req, res, next) => {
    try {
        const username = req.body.username.trim();
        const email = req.body.email.trim().toLowerCase();
        const { password } = req.body;
        const existingUser = await User.unscoped().findOne({
            where: { [Op.or]: [{ username }, { email }] },
            attributes: ['username', 'email']
        });
        if (existingUser) {
            const field = existingUser.username === username ? 'username' : 'email';
            return res.status(409).json({ message: `${field} already exists` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });
        const userResponse = user.toJSON();
        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0].path;
            return res.status(409).json({ message: `${field} already exists` });
        }

        if (error.name === 'SequelizeValidationError') {
            const message = error.errors.map(err => ({ message: err.message, param: err.path }));
            return res.status(400).json({ message: 'Validation error', errors: message });
        }

        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const emailOrUsername = req.body.emailOrUsername.trim();
        const { password } = req.body;
        const user = await User.scope('withPassword').findOne({
            where: {
                [Op.or]: [
                    { email: emailOrUsername.toLowerCase() },
                    { username: emailOrUsername }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email/username or password' });
        }

        const payload = {
            id: user.id,
            username: user.username,
            name: user.username,
            email: user.email,
            role: user.role
        };
        const jwtSecret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
        const token = jwt.sign(payload, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN });
        // Session
        // req.session.userId = user.id;
        // res.status(200).json({ message: 'Login successful' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    res.json({ user: req.user });
};

exports.updateMe = async (req, res, next) => {
    try {
        const { username, email, address } = req.body;
        const user = await User.scope('withPassword').findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updates = {};
        if (username && username.trim() !== user.username) {
            const duplicate = await User.findOne({
                where: { username: username.trim(), id: { [Op.ne]: user.id } },
                attributes: ['id']
            });
            if (duplicate) {
                return res.status(409).json({ message: 'username already exists' });
            }
            updates.username = username.trim();
        }
        if (email && email.trim().toLowerCase() !== user.email) {
            const normalizedEmail = email.trim().toLowerCase();
            const duplicate = await User.findOne({
                where: { email: normalizedEmail, id: { [Op.ne]: user.id } },
                attributes: ['id']
            });
            if (duplicate) {
                return res.status(409).json({ message: 'email already exists' });
            }
            updates.email = normalizedEmail;
        }
        if (address !== undefined) {
            updates.address = address.trim();
        }

        if (Object.keys(updates).length > 0) {
            await user.update(updates);
        }

        const safeUser = await User.findByPk(user.id);
        return res.json({ message: 'Profile updated successfully', user: safeUser });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới' });
        }
        const user = await User.scope('withPassword').findByPk(req.user.id);
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác' });
        }
        await user.update({ password: await bcrypt.hash(newPassword, 10) });
        return res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        if (!req.session) {
            return res.json({ message: 'Logout successful' });
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.json({ message: 'Logout successful' });
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMyAvatar = async (req, res, next) => {
    if (!req.file || !req.file.processedFileName) {
        return res.status(400).json({ message: 'No avatar image uploaded or processed' });
    }
    try {
        const avatarPath = `/images/${req.file.processedFileName}`;
        const updatedUser = await User.update({ avatar: avatarPath }, { where: { id: req.user.id }});
        const safeUser = await User.findByPk(req.user.id);
        res.json({ message: 'Avatar updated successfully', user: safeUser });
    } catch (error) {
        next(error);
    }
};