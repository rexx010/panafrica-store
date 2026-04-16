const pool = require('../../config/db');

const createOrder = async (client, {customer_id, customer_currency, customer_total, exchange_rate_applied}) => {
    const result = await client.query(
        `INSERT INTO orders
            (customer_id, customer_currency, customer_total, exchange_rate_applied)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [customer_id, customer_currency, customer_total, exchange_rate_applied]
    );
    return result.rows[0];
};

const getOrderById = async (orderId) => {
    const result = await pool.query(
        `SELECT 
            o.*,
            u.full_name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.id = $1`,
        [orderId]
    );
    return result.rows[0];
};

const getOrdersByCustomerId = async (customerId) => {
    const result = await pool.query(
        `SELECT 
            o.*,
            u.full_name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.customer_id = $1
        ORDER BY o.created_at DESC`,
        [customerId]
    );
    return result.rows;
};

const getOrdersByMerchantId = async (merchantId) => {
    const result = await pool.query(
        `SELECT DISTINCT
            o.*,
            u.full_name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN users u ON o.customer_id = u.id
        WHERE oi.merchant_id = $1
        ORDER BY o.created_at DESC`,
        [merchantId]
    );
    return result.rows;
};

module.exports = {createOrder, getOrderById, getOrdersByCustomerId, getOrdersByMerchantId};