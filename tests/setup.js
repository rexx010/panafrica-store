const pool = require('../src/config/db');

const clearTestData = async () => {
    await pool.query('DELETE FROM payout_notifications');
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM cart_items');
    await pool.query('DELETE FROM products');
    await pool.query(`DELETE FROM users WHERE email LIKE '%@test.com'`);
};

module.exports = {clearTestData};