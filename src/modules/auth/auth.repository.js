const pool = require('../../config/db')

const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

const createUser = async ({email, password_hash, full_name, role, country, base_currency,}) => {
    const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, role, country, base_currency)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [email, password_hash, full_name, role, country, base_currency]
    );
    return result.rows[0]
};

module.exports = { findUserByEmail, findUserById, createUser};