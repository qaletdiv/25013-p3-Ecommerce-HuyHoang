const express = require('express'); // Import module express
const router = express.Router();
const { User, Profile } = require('../models')
const authenticateToken = require('../middlewares/authenticateToken');
const authorizeRole = require('../middlewares/authorizeRole');

router.use(authenticateToken, authorizeRole('admin'));

router.get('/', async (req, res, next) => { // Định nghĩa route GET '/'
    try {
        const users = await User.findAll({
            include: [{ model: Profile, as: 'profile' }]
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Profile, as: 'profile' }]
        });
        if(!user){
            return res.status(404).send('Không tìm thấy người dùng');
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});
module.exports = router