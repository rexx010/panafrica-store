const {z} = require('zod');

const registerDto = z.object({
    email: z
    .string({required_error: 'Email is required'})
    .email('Invalid email format')
    .toLowerCase(),

    password: z
    .string({required_error: 'Password is required'})
    .min(8, 'Password must be at least 8 characters')
    .max(15, 'Password is too long'),

    full_name: z
    .string({required_error: 'Full name is required'})
    .min(2, 'Full nmae must be at least 2 characters')
    .max(50, 'Full name is too long'),

    role: z.enum(['merchant', 'customer'],{
        required_error: 'Role is required',
        invalid_type_error: 'Role must be either merchant or customer',
    }),

    country: z.enum(['NG', 'GH', 'KE', 'ZA'],{
        required_error: 'Country is required',
        invalid_type_error: 'Country must be one of: NG, GH, KE, ZA'
    }),

    base_currency: z.enum(['NGN', 'GHS', 'KES', 'ZAR'], {
        required_error: 'Base currency is required',
    invalid_type_error: 'Currency must be one of: NGN, GHS, KES, ZAR',
    }),
});

const loginDto = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase(),

    password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),

});

module.exports = { registerDto, loginDto }