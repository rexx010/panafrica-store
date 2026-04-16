class Order{
    constructor(data) {
        this.id = data.id;
        this.customerId = data.customer_id;
        this.status = data.status;
        this.customerCurrency = data.customer_currency;
        this.customerTotal = parseFloat(data.customer_total);
        this.exchangeRateApplied = parseFloat(data.exchange_rate_applied);
        this.createdAt = data.created_at;

        this.customerName = data.customer_name || null;
        this.customerEmail = data.customer_email || null;
    }

    toJSON(){
        return {
            id: this.id,
            customerId: this.customerId,
            customerName: this.customerName,
            customerEmail: this.customerEmail,
            status: this.status,
            customerCurrency: this.customerCurrency,
            customerTotal: this.customerTotal,
            exchangeRateApplied: this.exchangeRateApplied,
            createdAt: this.createdAt,
        };
    }
}

module.exports = Order;