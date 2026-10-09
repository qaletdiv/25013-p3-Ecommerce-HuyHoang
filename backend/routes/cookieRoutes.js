const express = require('express');
const router = express.Router();

router.get('/set-cookie', (req, res) => {
    // Tạo 1 cookie đơn giản 
    res.cookie('username', '.guest');
    // Thiết lập thời gian sống 
    res.cookie('language', 'vietnamese', {maxAge: 900000, httpOnly: true});
    // Tạo cookie 
    res.cookie('sentitiveData', 'someToken123', {
        httpOnly: true, // Chống tấn công XSS
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường production
        sameSite: 'strict' // Chống tấn công CSRF 
    });
    res.json({ message: 'Cookies đã được thiết lập!' });
});

router.get('/read-cookie', (req, res) => {
    const username = req.cookies?.username || null;
    const language = req.cookies?.language || null;
    const sentitive = req.cookies?.sentitiveData || null;

    res.json({
        username,
        language,
        sentitive,
        message: 'Đọc cookies thành công!'
    });
});

router.get('/clear-cookie', (req, res) => {
    res.clearCookie('username');
    res.clearCookie('language');
    res.clearCookie('sentitiveData');
    res.json({ message: 'Cookies đã được xóa!' });
});

module.exports = router;