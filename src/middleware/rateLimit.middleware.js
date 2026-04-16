const rateLimit = require('express-rate-limit');

const loginLimitChecker = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            error: true,
            message: 'Too many login attemps. Please try again in a minute',
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const checkoutLimitChecker = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            error: true,
            message: 'Too many checkout attempt. Please try again in a minute',
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { loginLimitChecker, checkoutLimitChecker }