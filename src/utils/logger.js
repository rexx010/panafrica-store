const logger = {
  info: (message, data = '') => {
    console.log(`[INFO] ${new Date().toISOString()} — ${message}`, data);
  },

  error: (message, error = '') => {
    console.error(`[ERROR] ${new Date().toISOString()} — ${message}`);
    if (error && error.stack) {
      console.error(error.stack);
    } else if (error) {
      console.error(error);
    }
  },

  warn: (message, data = '') => {
    console.warn(`[WARN] ${new Date().toISOString()} — ${message}`, data);
  },
};

module.exports = logger;