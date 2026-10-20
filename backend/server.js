require('dotenv').config();

const cors = require('cors');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

const app = express();
const productsRouter = require('./routes/productRoutes.js')
const categoryRouter = require ('./routes/categoryRoutes.js')
const authRouter = require('./routes/authRoutes.js');
const requestLoggerMiddleware = require('./middlewares/requestLogger.js');
const errorHandlerMiddleware = require('./middlewares/errorHandle.js')
const db = require('./models/index.js');
const PORT = 3001;
const userRouter = require('./routes/userRoutes.js');
const cookieRouter = require('./routes/cookieRoutes.js');
const sessionRouter = require('./routes/sessionRoutes.js');
const reviewRouter = require('./routes/reviewRoutes.js');
const paymentRouter = require('./routes/paymentRoutes.js');
const orderRouter = require('./routes/orderRoutes.js');
const { handleWebhook } = require('./controllers/stripeController.js');

app.use(cookieParser()); // Sử dụng cookie-parser để phân tích cookie


// Cấu hình và tạo session 
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: false
};

const sessionStore = new MySQLStore(dbConfig);
// Cấu hình session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 86400000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
}));

app.use(cors()); // Sử dụng CORS để cho phép truy cập từ các nguồn khác

app.use(requestLoggerMiddleware);
app.use(express.static(path.join(__dirname, 'public'))); // Định nghĩa thư mục public để phục vụ các tệp tĩnh
app.use(helmet()); // Sử dụng Helmet để bảo vệ ứng dụng khỏi một số lỗ hổng bảo mật phổ biến
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 300, // Cho phép các request đọc dữ liệu và thao tác mua hàng thông thường
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
    standardHeaders: true, // Gửi thông tin giới hạn trong header `RateLimit-*`
    legacyHeaders: false, // Không gửi thông tin giới hạn trong header `X-RateLimit-*`
    skip: (req) =>
        req.method === 'GET' &&
        (req.path === '/api/products' ||
            req.path.startsWith('/api/products/') ||
            req.path === '/api/categories' ||
            req.path.startsWith('/api/categories/'))
});
app.use(limiter);
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'public')));
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.get('/', (req, res) => { // Định nghĩa route GET '/'
    res.send('Chào mừng đến với Express API!'); // Gửi response "Chào mừng..."
});


app.use('/api/categories', categoryRouter);
app.use('/api',productsRouter); 
app.use('/api/cookies', cookieRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/orders', orderRouter);
app.use(errorHandlerMiddleware);

db.sequelize.authenticate()
.then(() => {
    console.log('Kết nối cơ sở dữ liệu thành công!');
    return db.sequelize.query(
        'ALTER TABLE Users ADD COLUMN address VARCHAR(255) NULL'
    ).catch((error) => {
        if (error.original?.errno !== 1060 && error.parent?.errno !== 1060) {
            throw error;
        }
    });
})
.then(() => db.sequelize.query(
    'ALTER TABLE products ADD COLUMN hidden TINYINT(1) NOT NULL DEFAULT 0'
).catch((error) => {
    if (error.original?.errno !== 1060 && error.parent?.errno !== 1060) {
        throw error;
    }
}))
.then(() => db.Review.sync())
.then(() => db.DiscountAmount.sync())
.then(() => db.Order.sync())
.then(() => db.OrderItem.sync())
.then(() => db.sequelize.query(
    'ALTER TABLE order_items ADD COLUMN thumbnail TEXT NULL'
).catch((error) => {
    if (error.original?.errno !== 1060 && error.parent?.errno !== 1060) {
        throw error;
    }
}))
.then(() => Promise.all([
    db.DiscountAmount.findOrCreate({ where: { code: 'SAVE20' }, defaults: { percentage: 20 } }),
    db.DiscountAmount.findOrCreate({ where: { code: 'SAVE30' }, defaults: { percentage: 30 } }),
    db.DiscountAmount.findOrCreate({ where: { code: 'SAVE50' }, defaults: { percentage: 50 } })
]))
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Express đang lắng nghe tại http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Không thể khởi động server vì database chưa sẵn sàng:', err);
    });