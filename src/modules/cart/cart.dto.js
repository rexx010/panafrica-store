const { z } = require("zod");

const addToCartDto = z.object({
    productId: z
    .string({required_error: 'Product is required'})
    .uuid('Product ID must be a valid uuid'),

    quantity: z
    .number({required_error: 'Quantity is required', invalid_type_error: 'Quantity must be number'})
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
});

module.exports = {addToCartDto}