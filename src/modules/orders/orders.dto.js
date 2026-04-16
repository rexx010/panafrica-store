const { z } = require('zod');
const checkeoutDto = z.object({}).optional();

module.exports = {checkeoutDto};