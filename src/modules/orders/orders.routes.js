const { Router } = require('express');
const { checkoutController, getOrderController, getOrdersController} = require('./orders.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const { checkoutLimitChecker } = require('../../middleware/rateLimit.middleware');

const router = Router();


router.post(
    '/checkout',
    authenticate,
    requireRole('customer'),
    checkoutLimitChecker,
    checkoutController
);

router.get(
    '/orders',
    authenticate,
    getOrdersController
);

router.get(
    '/orders/:id',
    authenticate,
    getOrderController
);

module.exports = router;