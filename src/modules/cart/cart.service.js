const { getCartByUserId, getCartItemByProductId, addCartItem, updateCartItemQuantity, removeCartItem, getCartItemById,} = require('./cart.repository');
const { getProductById } = require('../products/products.repository');
const { convertPrice } = require('../rates/rates.service');
const CartItem = require('./cart.model');

const addToCart = async (userId, {productId, quantity}) => {
    const product = await getProductById(productId);
    if(!product){
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }
    if(!product.is_active){
        const error = new Error('Product is no longer available');
        error.statusCode = 400;
        throw error;
    }
    const existingItem = await getCartItemByProductId(userId, productId);
    if(existingItem){
        const newQuantity = existingItem.quantity + quantity;
        const updated = await updateCartItemQuantity(existingItem.id, newQuantity);
        return new CartItem(updated).toJSON();
    }
    const newItem = await addCartItem(userId, productId, quantity);
    return new CartItem(newItem).toJSON();
};

const getCart = async (userId, customerCurrency) => {
    const rows = await getCartByUserId(userId);
    if(rows.length === 0) {
        return {
            items: [],
            total: 0,
            currency: customerCurrency,
            itemCount: 0,
        };
    }

    let isStale = false;
    let rateTimestamp = null;

    const items = await Promise.all(
        rows.map(async (row) => {
            const item = new CartItem(row);


            const conversion = await convertPrice(
            item.productPrice,
            item.productCurrency,
            customerCurrency
            );
            if (conversion.isStale) isStale = true;
            rateTimestamp = conversion.fetchedAt;

            const lineTotal = parseFloat(
                (conversion.convertedAmount * item.quantity).toFixed(2)
            );
            return {
                ...item.toJSON(),
                unitPrice: conversion.convertedAmount,
                displayCurrency: customerCurrency,
                lineTotal,
                originalPrice: item.productPrice,
                originalCurrency: item.productCurrency,
            };
        })
    );
    const total = parseFloat(
        items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)
    );
    return {
        items,
        total,
        currency: customerCurrency,
        itemCount: items.length,
        isStale,
        rateTimestamp,
    };
};

const removeFromCart = async (cartItemId, userId) => {
    const item = await getCartItemById(cartItemId,userId);
    if(!item){
        const error = new Error('Cart item not found');
        error.statusCode = 404;
        throw error;
    }

    await removeCartItem(cartItemId, userId);
    return { message: 'Item removed from cart' };
}

module.exports = { addToCart, getCart, removeFromCart};