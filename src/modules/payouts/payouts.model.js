class PayoutNotification {
    constructor(data) {
        this.id = data.id;
        this.orderId = data.order_id;
        this.merchantId = data.merchant_id;
        this.amount = parseFloat(data.amount);
        this.currency = data.currency;
        this.status = data.status;
        this.createdAt = data.created_at;
    }

    toJSON() {
        return {
            id: this.id,
            orderId: this.orderId,
            merchantId: this.merchantId,
            amount: this.amount,
            currency: this.currency,
            status: this.status,
            createdAt: this.createdAt,
        };
    }
}

module.exports = PayoutNotification;