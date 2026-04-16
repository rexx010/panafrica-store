const jwt = require('jsonwebtoken');
const {sendUnauthorized} = require('../utils/response')

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendUnauthorized(res, 'No token provided');
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendUnauthorized(res, 'Token has expired');
        }
        return sendUnauthorized(res, 'Invalid token');
    }
};


const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                error: true,
                message: `Access denied, Only ${role}s can perform this action`
            });
        }
        next();
    };
};

module.exports = {authenticate, requireRole};