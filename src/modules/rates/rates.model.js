class RateCache {
    constructor(data) {
        this.id = data.id;
        this.baseCurrency = data.base_currency;
        this.rates = data.rates;
        this.fetchedAt = data.fetched_at;
        this.isStale = data.is_stale;
    }

    isExpired() {
        const thirtyMinutes = 30 * 60 * 1000;
        const now = new Date();
        const fetchedAt = new Date(this.fetchedAt)
        return now - fetchedAt > thirtyMinutes;
    }

    toJSON(){
        return {
            baseCurrency: this.baseCurrency,
            rates: this.rates,
            fetchedAt: this.fetchedAt,
            isStale: this.isStale,
        };
    }
}

module.exports = RateCache;