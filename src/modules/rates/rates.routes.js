const { Router } = require('express');
const { getRatesController } = require('./rates.controller');

const router = Router();

router.get('/', getRatesController);

module.exports = router;