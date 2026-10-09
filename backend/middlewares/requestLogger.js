function requestLoggerMiddleware(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`); // (1) Log method và URL
    next(); // (2) Gọi middleware tiếp theo
}
module.exports = requestLoggerMiddleware;