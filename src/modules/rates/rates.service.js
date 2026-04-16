const axios = require('axios');
const { getLatestRate, getAllLatestRates, saveRate } = require('./rates.repository');
const RateCache = require('./rates.model');
const logger = require('../../utils/logger');

const LIST_OF_CURRENCIES =  ['NGN', 'GHS', 'KES', 'ZAR'];

const fetchAndCacheRates = async () => {
    logger.info('Fetching fresh exchange rates from API');

    for(const currency of LIST_OF_CURRENCIES) {
        try {
            const response = await axios.get(
                `${process.env.EXCHANGE_RATE_API_URL}/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${currency}`,
                {timeout: 5000}
            );

            if (response.data.result !== 'success') {
                throw new Error(`API returned: ${response.data.result}`);
            }

            const allRates = response.data.conversion_rates;
            const rates = {
                NGN: allRates['NGN'],
                GHS: allRates['GHS'],
                KES: allRates['KES'],
                ZAR: allRates['ZAR'],
                USD: allRates['USD'],
             };
 
             await saveRate(currency, rates, false);
             logger.info(`Exchange rates cached for ${currency}`);          
        } catch (error) {
            logger.error(`Failed to fetch rates for ${currency}:`, error.message);
            await markRatesAsStale(currency);
        }
    }
};

const getRate = async (baseCurrency) => {
//   console.log('1. getRate called with baseCurrency:', baseCurrency);

  const fetchedRate = await getLatestRate(baseCurrency);
//   console.log('2. fetchedRate from DB:', fetchedRate);

  if (!fetchedRate) {
    const error = new Error('Exchange rates unavailable. Please try again later.');
    error.statusCode = 503;
    throw error;
  }

  const cachedRate = new RateCache(fetchedRate);
//   console.log('3. cachedRate created:', cachedRate);
//   console.log('4. isExpired:', cachedRate.isExpired());

  if (cachedRate.isExpired()) {
    try {
      await fetchAndCacheRates();
      const newFetchedRate = await getLatestRate(baseCurrency);
      return new RateCache(newFetchedRate);
    } catch (error) {
      console.warn('Rate refresh failed, using stale data:', error.message);
      cachedRate.isStale = true;
      return cachedRate;
    }
  }

  return cachedRate;
};

const convertPrice = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) {
        return {
            convertedAmount: amount,
            rate: 1,
            isStale: false,
            fetchedAt: new Date().toISOString(),
        };
    }

    const cachedRate = await getRate(fromCurrency);
    const rate = cachedRate.rates[toCurrency];
    if (!rate) {
        const error = new Error(`Conversion rate from ${fromCurrency} to ${toCurrency} not available.`);
        error.statusCode = 503;
        throw error;
    }

    const convertedAmount = parseFloat((amount * rate).toFixed(2));
    return {
        convertedAmount,
        rate,
        isStale: cachedRate.isStale,
        fetchedAt: cachedRate.fetchedAt,
    };
};

const markRatesAsStale = async (baseCurrency) => {
    const pool = require('../../config/db');
    await pool.query(
        `UPDATE rate_cache
        SET is_stale = true
        WHERE id = (
        SELECT id FROM rate_cache
        WHERE base_currency = $1
        ORDER BY fetched_at DESC
        LIMIT 1
    )`,
    [baseCurrency]
    );
};

const startRateRefreshJob = async () => {
    await fetchAndCacheRates();
    const THIRTY_MINUTES = 30 * 60 * 1000;
    setInterval(async () => {
        logger.info('Running scheduled rate refresh')
        await fetchAndCacheRates();
    }, THIRTY_MINUTES);
    logger.info('Rate refresh job started — runs every 30 minutes');
};

const getCurrentRates = async () => {
    const rates = await getAllLatestRates();
    if(!rates.length) {
        const error = new Error('No rates available. Please try again later.');
        error.statusCode = 503;
        throw error;
    }
    return rates.map((rate) => new RateCache(rate).toJSON());
};

module.exports = { fetchAndCacheRates, getRate, convertPrice, startRateRefreshJob, getCurrentRates };