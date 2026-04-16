const pool = require("../../config/db")


const getCartByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT
            ci.id,
            ci.user_id,
            ci.product_id,
            ci.quantity,
            ci.created_at,
            p.name AS product_name,
            p.price AS product_price,
            p.currency AS product_currency,
            p.is_active,
            p.merchant_id,
            u.full_name AS merchant_name
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN users u ON p.merchant_id = u.id
        WHERE ci.user_id = $1
        AND p.is_active = true
        ORDER BY ci.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const getCartItemById = async (cartItemId, userId) => {
    const result = await pool.query(
        `SELECT * FROM cart_items
        WHERE id = $1 AND user_id = $2`,
        [cartItemId, userId]
    );
    return result.rows[0];
};

const getCartItemByProductId = async (userId, productId) => {
    const result = await pool.query(
        `SELECT * FROM cart_items
        WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
    );
    return result.rows[0];
};

const addCartItem = async (userId, productId, quantity) => {
    const result = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [userId, productId, quantity]
    );
    return result.rows[0];
};

const updateCartItemQuantity = async (cartItemId, quantity) => {
    const result = await pool.query(
        `UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING *`,
        [quantity, cartItemId]
    );
    return result.rows[0];
};

const removeCartItem = async (cartItemId, userId) => {
    const result = await pool.query(
        `DELETE FROM cart_items
        WHERE id = $1 AND user_id = $2
        RETURNING *`,
        [cartItemId, userId]
    );
    return result.rows[0];
};

const clearCart = async (userId) => {
    await pool.query(
        `DELETE FROM cart_items WHERE user_id = $1`,
        [userId]
    );
};

module.exports = {getCartByUserId, getCartItemById, getCartItemByProductId, addCartItem, updateCartItemQuantity, removeCartItem, clearCart};