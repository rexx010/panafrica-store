const { z } = require('zod');
const createProductDto = z.object({
    name: z
    .string({required_error: 'Product name is required'})
    .min(2, 'Product name must be at least 2 characters')
    .max(20, 'Product name is too long'),

    description: z
    .string()
    .max(1000, 'Description is too long')
    .optional(),

    price: z
    .number({ required_error: 'Price is required',
              invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .multipleOf(0.01, 'Price can have at most 2 decimal places'),

    category: z
    .string()
    .max(100, 'Category is too long')
    .optional(),

    image_url: z
    .string()
    .url('Invalid image URL format')
    .optional(),
});

const updateProductDto = createProductDto.partial();

module.exports = { createProductDto, updateProductDto };