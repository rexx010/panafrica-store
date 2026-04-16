class CartItem {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.productId = data.product_id;
        this.quantity = data.quantity;
        this.createdAt = data.created_at;

        this.productName = data.product_name || null;
        this.productCurrency = data.product_currency || null;
        this.productPrice = data.product_price ? parseFloat(data.product_price) : null;
        this.merchantId = data.merchant_id || null;
        this.merchantName = data.merchant_name || null;
        this.isActive = data.is_active;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            productId: this.productId,
            quantity: this.quantity,
            productName: this.productName,
            productCurrency: this.productCurrency,
            productPrice: this.productPrice,
            merchantId: this.merchantId,
            merchantName: this.merchantName,
            createdAt: this.createdAt,
        };
    }
}

module.exports = CartItem;