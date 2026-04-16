class User{
    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.fullName = data.full_name;
        this.role = data.role;
        this.country = data.country;
        this.baseCurrency = data.base_currency;
        this.createdAt = data.created_at;
    }

    toJSON(){
        return{
            id: this.id,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
            country: this.country,
            baseCurrency: this.baseCurrency,
            createdAt: this.createdAt,
        };
    }
}

module.exports = User;