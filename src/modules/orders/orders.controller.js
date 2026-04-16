const { checkout, getOrder, getOrders } = require('./orders.service');
const { sendSuccess, sendCreated, sendError } = require('../../utils/response');
const logger = require('../../utils/logger');


const checkoutController = async (req, res) => {
    try {
        const { id: customerId, baseCurrency: customerCurrency } = req.user;
        const result = await checkout(customerId, customerCurrency);
        logger.info(`Checkout completed — customer: ${customerId}, total: ${result.summary.customerTotal} ${customerCurrency}`);
        return sendCreated(res, result, 'Order placed successfully');
    } catch (error) {
        logger.error('Checkout failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};


const getOrderController = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { id: userId, role: userRole } = req.user;
        const result = await getOrder(orderId, userId, userRole);
        logger.info(`Order ${orderId} retrieved by ${userRole}: ${userId}`);
        return sendSuccess(res, result, 'Order retrieved successfully');
    } catch (error) {
        logger.error('Get order failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};


const getOrdersController = async (req, res) => {
    try {
        const { id: userId, role: userRole } = req.user;
        const orders = await getOrders(userId, userRole);
        logger.info(`Orders retrieved — ${userRole}: ${userId}, count: ${orders.length}`);
        return sendSuccess(res, orders, 'Orders retrieved successfully');
    } catch (error) {
        logger.error('Get orders failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};


module.exports = { checkoutController, getOrderController, getOrdersController };
