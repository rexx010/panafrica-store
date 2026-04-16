const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const { clearTestData } = require('./setup');

describe('Orders Module', () => {
  let merchantToken;
  let customerToken;
  let customerId;
  let orderId;
  let productId;

  beforeAll(async () => {
    await clearTestData();

    const merchantRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'ordermerchant@test.com',
        password: 'password123',
        full_name: 'Order Merchant',
        role: 'merchant',
        country: 'NG',
        base_currency: 'NGN',
      });
    merchantToken = merchantRes.body.data.token;

    const customerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'ordercustomer@test.com',
        password: 'password123',
        full_name: 'Order Customer',
        role: 'customer',
        country: 'GH',
        base_currency: 'GHS',
      });
    customerToken = customerRes.body.data.token;
    customerId = customerRes.body.data.user.id;

    const productRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${merchantToken}`)
      .send({
        name: 'Order Test',
        price: 5000,
        category: 'Test',
      });
    productId = productRes.body.data.id;

    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 1 });
  });

  afterAll(async () => {
    await clearTestData();
    await pool.end();
  });

  it('should lock the exchange rate at checkout and store it on the order', async () => {
    const response = await request(app)
      .post('/checkout')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const { order, summary } = response.body.data;
    expect(order.exchangeRateApplied).toBeDefined();
    expect(order.exchangeRateApplied).toBeGreaterThan(0);

    expect(summary.exchangeRateApplied).toBe(order.exchangeRateApplied);

    expect(summary.rateLockedAt).toBeDefined();

    orderId = order.id;

    const result = await pool.query(
      'SELECT exchange_rate_applied FROM orders WHERE id = $1',
      [orderId]
    );
    expect(result.rows[0].exchange_rate_applied).toBeDefined();
    expect(parseFloat(result.rows[0].exchange_rate_applied)).toBeGreaterThan(0);
  });

  it('should return 403 when an unrelated user tries to access an order', async () => {
    const strangerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'stranger@test.com',
        password: 'password123',
        full_name: 'Stranger',
        role: 'customer',
        country: 'ZA',
        base_currency: 'ZAR',
      });
    const strangerToken = strangerRes.body.data.token;

    const response = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${strangerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe(true);
  });

  it('should calculate cart total correctly in customer currency', async () => {
    const merchant2Res = await request(app)
      .post('/auth/register')
      .send({
        email: 'zamerchant@test.com',
        password: 'password123',
        full_name: 'ZA Merchant',
        role: 'merchant',
        country: 'ZA',
        base_currency: 'ZAR',
      });
    const merchant2Token = merchant2Res.body.data.token;

    const zarProductRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${merchant2Token}`)
      .send({
        name: 'ZAR Product',
        price: 100,
        category: 'Test',
      });

    const freshCustomerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'freshcustomer@test.com',
        password: 'password123',
        full_name: 'Fresh Customer',
        role: 'customer',
        country: 'GH',
        base_currency: 'GHS',
      });
    const freshCustomerToken = freshCustomerRes.body.data.token;

    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${freshCustomerToken}`)
      .send({ productId, quantity: 1 });

    await request(app)
      .post('/cart')
      .set('Authorization', `Bearer ${freshCustomerToken}`)
      .send({
        productId: zarProductRes.body.data.id,
        quantity: 1,
      });

    const cartResponse = await request(app)
      .get('/cart')
      .set('Authorization', `Bearer ${freshCustomerToken}`);

    expect(cartResponse.status).toBe(200);
    const cart = cartResponse.body.data;

    cart.items.forEach((item) => {
      expect(item.displayCurrency).toBe('GHS');
      expect(item.unitPrice).toBeGreaterThan(0);
      expect(item.lineTotal).toBeGreaterThan(0);
    });

    const expectedTotal = cart.items.reduce(
      (sum, item) => sum + item.lineTotal, 0
    );
    expect(parseFloat(cart.total.toFixed(2)))
      .toBe(parseFloat(expectedTotal.toFixed(2)));

    expect(cart.currency).toBe('GHS');
  });

  it('should return 429 after 5 checkout attempts in one minute', async () => {
    const rateLimitCustomerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'ratelimit@test.com',
        password: 'password123',
        full_name: 'Rate Limit Customer',
        role: 'customer',
        country: 'NG',
        base_currency: 'NGN',
      });
    const rateLimitToken = rateLimitCustomerRes.body.data.token;

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/checkout')
        .set('Authorization', `Bearer ${rateLimitToken}`);
    }

    const response = await request(app)
      .post('/checkout')
      .set('Authorization', `Bearer ${rateLimitToken}`);

    expect(response.status).toBe(429);
  });
});
