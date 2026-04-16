const pool = require('../../config/db');

const createOrderItem = async (client, {order_id, product_id, merchant_id, quantity, unit_price_merchant_currency, merchant_currency, merchant_payout_amount}) => {
    const result = await client.query(
        `INSERT INTO order_items
            (order_id, product_id, merchant_id, quantity,
            unit_price_merchant_currency, merchant_currency, merchant_payout_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            order_id, product_id, merchant_id, quantity,
            unit_price_merchant_currency, merchant_currency, merchant_payout_amount,
        ]
    );
    return result.rows[0];
};

const getOrderItemsByOrderId = async (orderId) => {
    const result = await pool.query(
        `SELECT
            oi.*,
            p.name AS product_name,
            u.full_name AS merchant_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN users u ON oi.merchant_id = u.id
        WHERE oi.order_id = $1`,
        [orderId]
    );
    return result.rows;
};

module.exports = { createOrderItem, getOrderItemsByOrderId };