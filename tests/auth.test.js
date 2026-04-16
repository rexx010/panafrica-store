const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const {clearTestData} = require('./setup');

describe('Authentication Module', () => {
    beforeAll(async () => {
        await clearTestData();
    });

    afterAll(async () => {
        await clearTestData();
        await pool.end();
    });

    it('should return 400 with clear error when email is missing', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
               password: 'password123',
                full_name: 'Test User',
                role: 'customer',
                country: 'NG',
                base_currency: 'NGN',
            });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe(true);
        expect(response.body.errors).toBeDefined();
        const emailError = response.body.errors.find(
            (err) => err.field === 'email'
        );
        expect(emailError).toBeDefined();
    });

    it('should register a merchant successfully and return a token', async () => {
        const response = await request(app)
        .post('/auth/register')
        .send({
            email: 'merchant@test.com',
            password: 'password123',
            full_name: 'Test Merchant',
            role: 'merchant',
            country: 'NG',
            base_currency: 'NGN',
        });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
        expect(typeof response.body.data.token).toBe('string');
        expect(response.body.data.user.role).toBe('merchant');
        expect(response.body.data.user.passwordHash).toBeUndefined();
        expect(response.body.data.user.password_hash).toBeUndefined();
    });

    it('should return 409 when registering with an existing email', async () => {
        await request(app)
        .post('/auth/register')
        .send({
            email: 'duplicate@test.com',
            password: 'password123',
            full_name: 'First User',
            role: 'customer',
            country: 'GH',
            base_currency: 'GHS',
        });

        const response = await request(app)
        .post('/auth/register')
        .send({
            email: 'duplicate@test.com',
            password: 'password123',
            full_name: 'Second User',
            role: 'customer',
            country: 'GH',
            base_currency: 'GHS',
        });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe(true);
    });

    it('should login successfully and return a token', async () => {
        await request(app)
        .post('/auth/register')
        .send({
            email: 'login@test.com',
            password: 'password123',
            full_name: 'Login Test User',
            role: 'customer',
            country: 'KE',
            base_currency: 'KES',
        });

        const response = await request(app)
        .post('/auth/login')
        .send({
            email: 'login@test.com',
            password: 'password123',
        });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 with invalid credentials message for wrong password', async () => {
        const response = await request(app)
        .post('/auth/login')
        .send({
            email: 'login@test.com',
            password: 'wrongpassword',
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });
});