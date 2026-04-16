const { register, login } = require('./auth.service');
const { sendCreated, sendSuccess, sendError} = require('../../utils/response')
const logger = require('../../utils/logger');

const registerController = async (req, res) => {
    try {
        const result = await register(req.body);
        logger.info(`New ${req.body.role} registered: ${req.body.email}`);
        return sendCreated(res, result, 'Registration successful');
    } catch (error) {
        logger.error('Registration failed', error);
        return sendError(
            res,
            error.message,
            error.statusCode || 400
        );
        
    }
};

const loginController = async (req, res) => {
    try {
        const result = await login(req.body);
        logger.info(`User logged in: ${req.body.email}`);
        return sendSuccess(res, result, 'Login successful');
    } catch (error) {
        logger.error('Login failed', error);
        return sendError(
            res,
            error.message,
            error.statusCode || 400
        );
        
    }
};

module.exports = { registerController, loginController };