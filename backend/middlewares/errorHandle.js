function errorHandlerMiddleware(err, req, res, next) { // (1) 4 arguments: err, req, res, next
console.error('ERROR:', err.stack || err.message); // (2) Log lỗi chi tiết

if (err.status) {
	return res.status(err.status).json({ message: err.message });
}

if (err.name === 'MulterError') {
	const message = err.code === 'LIMIT_FILE_SIZE'
		? 'Ảnh không được vượt quá 5MB'
		: err.message;
	return res.status(400).json({ message });
}

if (err.message === 'Chỉ chấp nhận file hình ảnh!') {
	return res.status(400).json({ message: err.message });
}

if (err.name === 'SequelizeValidationError') {
	return res.status(400).json({ message: err.errors.map((item) => item.message).join(', ') });
}

res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại sau.' }); // (3) Gửi response lỗi 500
}
module.exports = errorHandlerMiddleware;