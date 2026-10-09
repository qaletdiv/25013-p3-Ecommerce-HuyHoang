const multer = require('multer');
const path = require('path');

const multerStorage = multer.diskStorage({
    //Nơi lưu trữ file tạm thời
    destination: (req, file, cb) => {
        const tempPath = path.join(__dirname, '..', 'public', 'temp');
        // ensure directory exists
        const fs = require('fs');
        try {
            fs.mkdirSync(tempPath, { recursive: true });
        } catch (e) {
            return cb(e);
        }
        cb(null, tempPath);
    },
    //Đặt tên file
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `image-${uniqueSuffix}${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    //Kiểm tra loại file
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn kích thước file là 5MB
});

// Middleware để xử lý upload file hình ảnh
exports.uploadSingleImage = (fieldName) => {
    return upload.single(fieldName);
};