const pool = require("../../config/db");

const getAllProducts = async ({search, category, country}) => {
    let query = `
    SELECT
        P.*,
        u.full_name AS merchant_name,
        u.country AS merchant_country
    FROM products p
    JOIN users u ON p.merchant_id = u.id
    WHERE p.is_active = true
    `;

    const values = [];
    let paramCount = 1;

    if(search) {
        query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        values.push(`%${search}%`);
        paramCount++;
    }
    if(category) {
        query += ` AND p.category ILIKE $${paramCount}`;
        values.push(`%${category}%`);
        paramCount++;
    }
    if(country) {
        query += ` AND u.country = $${paramCount}`;
        values.push(country);
        paramCount++;
    }
    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, values);
    return result.rows;
};

const getProductById = async (id) => {
    const result = await pool.query(
        `SELECT
        p.*,
        u.full_name AS merchant_name,
        u.country AS merchant_country
        FROM products p
        JOIN users u ON p.merchant_id = u.id
        WHERE p.id = $1`,
        [id]
    );
    return result.rows[0];
};

const createProduct = async ({merchant_id, name, description, price, currency, category, image_url}) => {
    const result = await pool.query(
        `INSERT INTO products
        (merchant_id, name, description, price, currency, category, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [merchant_id, name, description, price, currency, category, image_url]
    );
    return result.rows[0];
};

const updateProduct = async (id, fields) => {
    const keys = Object.keys(fields);
    const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');
    
    const values = [...Object.values(fields), id];
    const result = await pool.query(
        `UPDATE products
        SET ${setClause}
        WHERE id = $${keys.length + 1}
        RETURNING *`,
        values
    );
    return result.rows[0];
};

const softDeleteProduct = async (id) => {
    const result = await pool.query(
        `UPDATE products
        SET is_active = false
        WHERE id = $1
        RETURNING *`,
        [id]
    );
    return result.rows[0];
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, softDeleteProduct }