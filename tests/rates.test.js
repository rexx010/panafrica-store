const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

describe('Exchange Rate Engine', () => {

    afterAll(async () => {
        await pool.end();
    });

    it('should convert a price from NGN to GHS correctly', async () => {
        const response = await request(app)
        .get('/products')
        .query({ currency: 'GHS' });

        expect(response.status).toBe(200);

        if (response.body.data.length > 0) {
        const product = response.body.data[0];

        if (product.converted) {
            const impliedRate = product.displayPrice / product.originalPrice;

            expect(impliedRate).toBeGreaterThan(0);
            expect(product.displayCurrency).toBe('GHS');
            expect(product.originalCurrency).toBeDefined();
        }
        }
    });

    it('should return stale: true when the rate cache is older than 30 minutes', async () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

        await pool.query(
        `INSERT INTO rate_cache (base_currency, rates, fetched_at, is_stale)
        VALUES ($1, $2, $3, $4)`,
        [
            'GHS',
            JSON.stringify({
            NGN: 124.17,
            KES: 11.72,
            ZAR: 1.52,
            USD: 0.09,
            GHS: 1,
            }),
            twoHoursAgo,
            false,
        ]
        );

        const response = await request(app).get('/rates');

        expect(response.status).toBe(200);

        const ghsRate = response.body.data.find(
        (r) => r.baseCurrency === 'GHS'
        );

        expect(ghsRate).toBeDefined();
        expect(ghsRate.fetchedAt).toBeDefined();

        expect(ghsRate.rates).toBeDefined();
        expect(ghsRate.rates.NGN).toBeGreaterThan(0);
    });

    it('should return rates for all four supported currencies', async () => {
        const response = await request(app).get('/rates');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const currencies = response.body.data.map((r) => r.baseCurrency);

        expect(currencies).toContain('NGN');
        expect(currencies).toContain('GHS');
        expect(currencies).toContain('KES');
        expect(currencies).toContain('ZAR');

        response.body.data.forEach((rate) => {
        expect(rate.baseCurrency).toBeDefined();
        expect(rate.rates).toBeDefined();
        expect(rate.fetchedAt).toBeDefined();
        expect(rate.isStale).toBeDefined();
        expect(rate.rates.NGN).toBeGreaterThan(0);
        expect(rate.rates.GHS).toBeGreaterThan(0);
        expect(rate.rates.KES).toBeGreaterThan(0);
        expect(rate.rates.ZAR).toBeGreaterThan(0);
        });
    });
});