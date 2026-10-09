const express = require('express');
const router = express.Router();

router.get('/set', (req, res) => {
    req.session.views = (req.session.views || 0) + 1;
    req.session.view = req.session.views;
    req.session.userData = { name: 'Toàn', role: 'user' };
    req.session.message = 'Session đã được thiết lập';

    res.json({
        message: `Session đã được thiết lập! View: ${req.session.views}`,
        session: req.session
    });
});

router.get('/get', (req, res) => {
    if (req.session.views) {
        res.json({
            message: 'session data retrieved successfully',
            views: req.session.views,
            userData: req.session.userData,
            messageText: req.session.message
        });
    } else {
        res.status(404).json({
            message: 'No session data found'
        });
    }
});


router.get('/update', (req, res) => {
    if(req.session.userData) {
       req.session.userData.lastseen = new Date();
       res.json({message: "Session data updated successfully", session: req.session});
    } else {
        res.status(404).json({
            message: "No session data found to update"
        })
    }
})

router.get('/destroy', (req, res) => {
    if(req.session){
        req.session.destroy(err => {
            if(err) {
                return res.status(500).json({ message: "Error destroying session", error: err });
            }
            res.clearCookie('connect.sid'); // Xóa cookie session
            res.json({ message: "Session destroyed" });
        });
    }else{
        res.status(404).json({ message: "No session found to destroy" });
    }
});

module.exports = router;