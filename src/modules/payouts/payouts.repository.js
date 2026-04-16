const pool = require("../../config/db");

const createPayoutNotification = async (client, {order_id, merchant_id, amount, currency}) => {
    const result = await client.query(
        `INSERT INTO payout_notifications
            (order_id, merchant_id, amount, currency)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [order_id, merchant_id, amount, currency]
    );
    return result.rows[0];
};

const getPayoutsByMerchantId = async (merchantId) => {
    const result = await pool.query(
        `SELECT * FROM payout_notifications
        WHERE merchant_id = $1
        ORDER BY created_at DESC`,
        [merchantId]
    );
    return result.rows;
};

module.exports = { createPayoutNotification, getPayoutsByMerchantId };