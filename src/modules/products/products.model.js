class Product {
    constructor(data) {
        this.id = data.id;
        this.merchantId = data.merchant_id;
        this.name = data.name;
        this.description = data.description;
        this.price = parseFloat(data.price);
        this.currency = data.currency;
        this.category = data.category;
        this.imageUrl = data.image_url;
        this.isActive = data.is_active;
        this.createdAt = data.created_at;
        this.merchantName = data.merchant_name || null;
        this.merchantCountry = data.merchant_country || null;
    }

    toJSON() {
        return {
            id: this.id,
            merchantId: this.merchantId,
            merchantName: this.merchantName,
            merchantCountry: this.merchantCountry,
            name: this.name,
            description: this.description,
            price: this.price,
            currency: this.currency,
            category: this.category,
            imageUrl: this.imageUrl,
            isActive: this.isActive,
            createdAt: this.createdAt,
        };
    }
}

module.exports = Product;