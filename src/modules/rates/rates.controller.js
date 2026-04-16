const { getCurrentRates } = require('./rates.service');
const {sendSuccess, sendError} = require('../../utils/response');
const logger = require('../../utils/logger');

const getRatesController = async (req, res) => {
    try {
        const rates = await getCurrentRates();
        return sendSuccess(res, rates, 'Current exchange rates');
    } catch (error) {
        logger.error('Get rates failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

module.exports = { getRatesController };