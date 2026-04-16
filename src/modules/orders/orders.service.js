const pool = require('../../config/db');
const { createOrder, getOrderById, getOrdersByCustomerId, getOrdersByMerchantId } = require('./orders.repository');
const { createOrderItem, getOrderItemsByOrderId } = require('./orderItems.repository');
const { createPayoutNotification } = require('../payouts/payouts.repository');
const { getCartByUserId, clearCart } = require('../cart/cart.repository');
const { getRate, convertPrice } = require('../rates/rates.service');
const { getProductById } = require('../products/products.repository');
const Order = require('./orders.model');
const OrderItem = require('./orderItems.model');
const logger = require('../../utils/logger');

const validateCart = async (customerId) => {
    const cartItem = await getCartByUserId(customerId);
    if(cartItem.length === 0){
        const error = new Error('Your cart is empty');
        error.statusCode = 400;
        throw error;
    }
    return cartItem;
}

const lockeExchangeRate = async (customerCurrency) => {
    const rateSnapShot = await getRate(customerCurrency);
    logger.info(`Exchange rate locked for ${customerCurrency} at ${rateSnapShot.fetchedAt}`);
    return rateSnapShot;
}

const calculateOrderTotals = async (cartItems, rateSnapShot, customerCurrency) => {
    let customerTotal = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems){
        const product = await getProductById(cartItem.product_id);

        const conversionRate = product.currency === customerCurrency ? 1
        : (rateSnapShot.rates[customerCurrency] || 1) /
        (rateSnapShot.rates[product.currency] || 1);

        const lineTotalInCustomerCurrency = parseFloat(
            (product.price * conversionRate * cartItem.quantity).toFixed(2)
        );

        customerTotal += lineTotalInCustomerCurrency;

        const merchantPayoutAmount = parseFloat(
            (product.price * cartItem.quantity).toFixed(2)
        );

        orderItemsData.push({
            product_id: product.id,
            merchant_id: product.merchant_id,
            quantity: cartItem.quantity,
            unit_price_merchant_currency: product.price,
            merchant_currency: product.currency,
            merchant_payout_amount: merchantPayoutAmount,
            line_total_customer_currency: lineTotalInCustomerCurrency,
        });
    }
    customerTotal = parseFloat(customerTotal.toFixed(2));
    logger.info(`Order totals calculated — customerTotal: ${customerTotal} ${customerCurrency}, items: ${orderItemsData.length}`);

    return { customerTotal, orderItemsData};
}

const persistOrder = async (client, {customerId, customerCurrency, customerTotal, rateSnapShot, orderItemsData}) => {
    const orderRow = await createOrder(client, {
        customer_id: customerId,
        customer_currency: customerCurrency,
        customer_total: customerTotal,
        exchange_rate_applied: rateSnapShot.rates[customerCurrency] || 1,
    });

    logger.info(`Order record created: ${orderRow.id}`);

    const merchantPayouts = {};
    for (const itemData of orderItemsData) {
        await createOrderItem(client, {
            order_id: orderRow.id,
            product_id: itemData.product_id,
            merchant_id: itemData.merchant_id,
            quantity: itemData.quantity,
            unit_price_merchant_currency: itemData.unit_price_merchant_currency,
            merchant_currency: itemData.merchant_currency,
            merchant_payout_amount: itemData.merchant_payout_amount,
        });
        if (!merchantPayouts[itemData.merchant_id]) {
            merchantPayouts[itemData.merchant_id] = {
                amount: 0,
                currency: itemData.merchant_currency,
            };
        }
        merchantPayouts[itemData.merchant_id].amount += itemData.merchant_payout_amount;
    }

    for (const [merchantId, payout] of Object.entries(merchantPayouts)) {
        await createPayoutNotification(client, {
        order_id: orderRow.id,
        merchant_id: merchantId,
        amount: parseFloat(payout.amount.toFixed(2)),
        currency: payout.currency,
        });

        logger.info(`Payout notification created — merchant: ${merchantId}, amount: ${payout.amount} ${payout.currency}`);
    }
    await clearCart(customerId);
    logger.info(`Cart cleared for customer: ${customerId}`);
    return orderRow;
};

const buildOrderResponse = async (orderRow, rateSnapshot, customerTotal, customerCurrency) => {
    const fullOrder = await getOrderById(orderRow.id);
    const orderItems = await getOrderItemsByOrderId(orderRow.id);

    return {
        order: new Order(fullOrder).toJSON(),
        items: orderItems.map((item) => new OrderItem(item).toJSON()),
        summary: {
            customerTotal,
            customerCurrency,
            exchangeRateApplied: rateSnapshot.rates[customerCurrency] || 1,
            rateLockedAt: rateSnapshot.fetchedAt,
            itemCount: orderItems.length,
        },
    };
};


const checkout = async (customerId, customerCurrency) => {
    const cartItems = await validateCart(customerId);
    const rateSnapShot = await lockeExchangeRate(customerCurrency);
    const {customerTotal, orderItemsData} = await calculateOrderTotals(cartItems, rateSnapShot, customerCurrency);
    const client = await pool.connect();

    let orderRow;
    try {
        await client.query('BEGIN');
        orderRow = await persistOrder(client, {
            customerId,
            customerCurrency,
            customerTotal,
            rateSnapShot,
            orderItemsData,
        });
        await client.query('COMMIT');
        logger.info(`Checkout transaction committed — order: ${orderRow.id}`);
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Checkout transaction rolled back', error);
        throw error;
    }finally {
        client.release();
    }

    return buildOrderResponse(orderRow, rateSnapShot, customerTotal, customerCurrency)
};


const getOrder = async (orderId, userId) => {
    const orderRow = await getOrderById(orderId);

    if(!orderRow) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        throw error;
    }

    const orderItems = await getOrderItemsByOrderId(orderId);

    const isCustomer = orderRow.customer_id === userId;
    const isMerchantOnOrder = orderItems.some(
        (item) => item.merchant_id === userId
    );

    if(!isCustomer && !isMerchantOnOrder) {
        const error = new Error('You do not have access to this order');
        error.statusCode = 403;
        throw error;
    }

    return {
        order: new Order(orderRow).toJSON(),
        items: orderItems.map((item) => new OrderItem(item).toJSON()),
    };
};

const getOrders = async (userId, userRole) => {
    let rows;

    if(userRole === 'merchant') {
        rows = await getOrdersByMerchantId(userId);
    } else {
        rows = await getOrdersByCustomerId(userId);
    }

    const orders = await Promise.all(
        rows.map(async (row) => {
            const items = await getOrderItemsByOrderId(row.id);
            return {
                order: new Order(row).toJSON(),
                items: items.map((item) => new OrderItem(item).toJSON()),
            };
        })
    );
    return orders;
};

module.exports = {checkout, getOrder, getOrders};