const { sendSuccess, sendCreated, sendError } = require("../../utils/response");
const { listProducts, getProduct, createNewProduct, updateExistingProduct, deleteProduct } = require("./products.service");
const logger = require('../../utils/logger');

const listProductsController = async (req, res) => {
    try {
        const {currency, search, category, country} = req.query;
        const products = await listProducts({search, category, country, currency});
        return sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
        logger.error('List products failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

const getProductController = async (req, res) => {
    try {
        const {id} = req.params;
        const {currency} = req.query;
        const product = await getProduct(id, currency);
        return sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
        logger.error('Get product failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

const createProductController = async(req, res) => {
    try {
        console.log('CREATE PRODUCT HIT', req.user);
        const { id: merchantId, baseCurrency } = req.user;
        console.log('merchantId:', merchantId, 'baseCurrency:', baseCurrency);
        const product = await createNewProduct(merchantId, baseCurrency, req.body);
        logger.info(`Product created: ${product.name} by merchant: ${merchantId}`);
        return sendCreated(res, product, 'Product created successfully');
    } catch (error) {
        logger.error('Create product failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

const updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: merchantId } = req.user;
        const product = await updateExistingProduct(id, merchantId, req.body);
        return sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
        logger.error('Update product failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

const deleteProductController = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: merchantId } = req.user;
        const product = await deleteProduct(id, merchantId);
        return sendSuccess(res, product, 'Product deleted successfully');
    } catch (error) {
        logger.error('Delete product failed', error);
        return sendError(res, error.message, error.statusCode || 500);
    }
};

module.exports = {listProductsController, getProductController, createProductController, updateProductController, deleteProductController};