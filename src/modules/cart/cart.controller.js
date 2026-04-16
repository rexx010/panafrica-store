const { addToCart, getCart, removeFromCart } = require('./cart.service');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response');
const logger = require('../../utils/logger');

const addToCartController = async (req, res) => {
    try {
        const {id: userId} = req.user;
        const item = await addToCart(userId, req.body);
        return sendCreated(res, item, 'Item added to cart');
    } catch (error) {
        logger.error('Add to cart failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

const getCartController = async (req, res) => {
    try {
        const {id: userId, baseCurrency} = req.user;
        const cart = await getCart(userId, baseCurrency);
        return sendSuccess(res, cart, 'Cart retrieved successfully');
    } catch (error) {
        logger.error('Get cart failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

const removeFromCartController = async (req, res) => {
    try {
        const{id: userId} = req.user;
        const {itemId} = req.params;
        const result = await removeFromCart(itemId, userId);
        return sendSuccess(res, result, 'Item removed from cart');
    } catch (error) {
        logger.error('Remove from cart failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

module.exports = { addToCartController, getCartController, removeFromCartController };