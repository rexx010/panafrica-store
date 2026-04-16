const { Router } = require('express');
const { registerController, loginController } = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const { loginLimitChecker } = require('../../middleware/rateLimit.middleware');
const { registerDto, loginDto } = require('./auth.dto');

const router = Router();

router.post('/register', validate(registerDto), registerController);

router.post('/login', loginLimitChecker, validate(loginDto), loginController);

module.exports = router;