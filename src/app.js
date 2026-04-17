require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoute = require('./modules/auth/auth.routes');
const ratesRoutes = require('./modules/rates/rates.routes');
const productsRoutes = require('./modules/products/products.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const logger = require('./utils/logger');

require('./config/db');

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`==> ${req.method} ${req.path}`);
    next();
});

app.get('/health', (req, res) => {
    res.json({ success: true, message: 'PanAfric API is running' });
});

app.use('/auth', authRoute);
app.use('/rates', ratesRoutes);
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);
app.use('/', ordersRoutes);

app.use((err, req, res, next) => {
    logger.error('Unhandled error reached global handler', err);
    res.status(err.statusCode || 500).json({
        success: false,
        error: true,
        message: err.message || 'Internal server error',
    });
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    console.error(error.stack);
});

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

const { startRateRefreshJob } = require('./modules/rates/rates.service');
startRateRefreshJob().catch((err) => {
    console.error('Failed to start rate refresh job:', err.message);
});

const https = require('https');
setInterval(() => {
    https.get('https://panafrica-store.onrender.com/health', () => {}).on('error', () => {});
}, 14 * 60 * 1000); 

module.exports = app;