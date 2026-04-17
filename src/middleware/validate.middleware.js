const validate =  (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map((issue) => ({
                field: issue.path.join('.') || null,
                message: issue.message,
            }))
            return res.status(400).json({
                success: false,
                error: true,
                message: errors[0].message,
                errors,
            });
        }

        req.body = result.data;
        next();
    };
};

module.exports = validate;