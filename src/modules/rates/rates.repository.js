const pool = require('../../config/db');

const getLatestRate = async (baseCurrency) => {
    const result = await pool.query(
        `SELECT * FROM rate_cache
        WHERE base_currency = $1
        ORDER BY fetched_at DESC
        LIMIT 1`,
        [baseCurrency]
    );
    return result.rows[0];
};

const getAllLatestRates = async () => {
    const result = await pool.query(
        `SELECT DISTINCT ON (base_currency) *
        FROM rate_cache
        ORDER BY base_currency, fetched_at DESC`
    );
    return result.rows;
};

const saveRate = async (baseCurrency, rates, isStale = false) => {
    const result = await pool.query(
        `INSERT INTO rate_cache (base_currency, rates, is_stale)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [baseCurrency, JSON.stringify(rates), isStale]
    );
    return result.rows[0];
};

module.exports = {getLatestRate, getAllLatestRates, saveRate};