const { Router } = require('express');
const {addToCartController, getCartController, removeFromCartController } = require('./cart.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { addToCartDto } = require('./cart.dto');

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('customer'),
  validate(addToCartDto),
  addToCartController
);

router.get(
  '/',
  authenticate,
  requireRole('customer'),
  getCartController
);

router.delete(
  '/:itemId',
  authenticate,
  requireRole('customer'),
  removeFromCartController
);

module.exports = router;