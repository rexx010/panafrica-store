const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { clearTestData } = require('./setup');

describe('Products Module', () => {
    let merchantToken;
    let customerToken;
    let productId;

    beforeAll(async () => {
        await clearTestData();

        const merchantRes = await request(app)
        .post('/auth/register')
        .send({
            email: 'prodmerchant@test.com',
            password: 'password123',
            full_name: 'Product Merchant',
            role: 'merchant',
            country: 'NG',
            base_currency: 'NGN',
        });
        merchantToken = merchantRes.body.data.token;

        const customerRes = await request(app)
        .post('/auth/register')
        .send({
            email: 'prodcustomer@test.com',
            password: 'password123',
            full_name: 'Product Customer',
            role: 'customer',
            country: 'GH',
            base_currency: 'GHS',
        });
        customerToken = customerRes.body.data.token;
    });

    afterAll(async () => {
        await clearTestData();
        await pool.end();
    });

    it('should return 403 when a customer tries to create a product', async () => {
        const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
            name: 'Test Product',
            price: 1000,
            category: 'Test',
        });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe(true);
    });

    it('should create a product successfully as a merchant', async () => {
        const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
            name: 'Test Ankara',
            description: 'Test fabric',
            price: 5000,
            category: 'Fashion',
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Test Ankara');
        expect(response.body.data.currency).toBe('NGN');
        productId = response.body.data.id;
    });

    it('should return 403 when merchant tries to update another merchants product', async () => {
        const merchant2Res = await request(app)
        .post('/auth/register')
        .send({
            email: 'merchant2@test.com',
            password: 'password123',
            full_name: 'Second Merchant',
            role: 'merchant',
            country: 'GH',
            base_currency: 'GHS',
        });
        const merchant2Token = merchant2Res.body.data.token;

        const response = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${merchant2Token}`)
        .send({ name: 'Hacked Product Name' });

        expect(response.status).toBe(403);
        expect(response.body.error).toBe(true);
    });

    it('should soft delete a product by setting is_active to false', async () => {
        const response = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${merchantToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.isActive).toBe(false);

        const result = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [productId]
        );
        expect(result.rows.length).toBe(1);
        expect(result.rows[0].is_active).toBe(false);
    });

    it('should return converted price when currency query param is provided', async () => {
        const createRes = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${merchantToken}`)
        .send({
            name: 'Conversion Test',
            price: 10000,
            category: 'Test',
        });

        const response = await request(app)
        .get('/products')
        .query({ currency: 'GHS' });

        expect(response.status).toBe(200);

        const product = response.body.data.find(
        (p) => p.name === 'Conversion Test'
        );

        expect(product).toBeDefined();
        expect(product.displayCurrency).toBe('GHS');
        expect(product.converted).toBe(true);
        expect(product.displayPrice).toBeGreaterThan(0);
        expect(product.rateTimestamp).toBeDefined();
    });
});