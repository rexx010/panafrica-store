class OrderItem {
    constructor(data) {
        this.id = data.id;
        this.orderId = data.order_id;
        this.productId = data.product_id;
        this.merchantId = data.merchant_id;
        this.quantity = data.quantity;
        this.unitPriceMerchantCurrency = parseFloat(data.unit_price_merchant_currency);
        this.merchantCurrency = data.merchant_currency;
        this.merchantPayoutAmount = parseFloat(data.merchant_payout_amount);
        this.createdAt = data.created_at;

        this.productName = data.product_name || null;
        this.merchantName = data.merchant_name || null;
    }

    toJSON() {
        return {
            id: this.id,
            orderId: this.orderId,
            productId: this.productId,
            merchantId: this.merchantId,
            quantity: this.quantity,
            unitPriceMerchantCurrency: this.unitPriceMerchantCurrency,
            merchantCurrency: this.merchantCurrency,
            merchantPayoutAmount: this.merchantPayoutAmount,
            productName: this.productName,
            merchantName: this.merchantName,
            createdAt: this.createdAt,
        };
    }
}

module.exports = OrderItem;