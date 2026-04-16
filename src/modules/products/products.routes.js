const { Router } = require('express');
const { listProductsController, getProductController, createProductController, updateProductController, deleteProductController} = require('./products.controller');
const { authenticate, requireRole } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createProductDto, updateProductDto } = require('./products.dto');

const router = Router();

router.get('/', listProductsController);
router.get('/:id', getProductController);
router.post('/', authenticate, requireRole('merchant'), validate(createProductDto), createProductController);
router.put('/:id', authenticate, requireRole('merchant'), validate(updateProductDto), updateProductController);
router.delete('/:id', authenticate, requireRole('merchant'), deleteProductController);

module.exports = router;