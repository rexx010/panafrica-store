const { getAllProducts, getProductById, createProduct, updateProduct, softDeleteProduct } = require('./products.repository');
const { convertPrice } = require('../rates/rates.service');
const Product = require('./products.model');

const listProducts = async ({search, category, country, currency}) => {
    const rows = await getAllProducts({search, category, country});
    const products = await Promise.all(
        rows.map(async (row) => {
            const product = new Product(row);

            if (!currency || currency === product.currency) {
                return {
                    ...product.toJSON(),
                    displayPrice: product.price,
                    displayCurrency: product.currency,
                    converted:false,
                };
            }

            const conversion = await convertPrice(
                product.price,
                product.currency,
                currency
            );

            return {
                ...product.toJSON(),
                displayPrice: conversion.convertedAmount,
                displayCurrency: currency,
                converted: true,
                originalPrice: product.price,
                originalCurrency: product.currency,
                stale: conversion.isStale,
                rateTimestamp: conversion.fetchedAt,
            };
        })
    );
    return products;
};

const getProduct = async (id, currency) => {
    const prod = await getProductById(id);
    if(!prod){
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    const product = new Product(prod);
    if (!currency || currency === product.currency) {
        return {
            ...product.toJSON(),
            displayPrice: product.price,
            displayCurrency: product.currency,
            converted: false,
        };
    }

    const conversion = await convertPrice(product.price, product.currency, currency);
    return{
        ...product.toJSON(),
        displayPrice: conversion.convertedAmount,
        displayCurrency: currency,
        converted: true,
        originalPrice: product.price,
        originalCurrency: product.currency,
        stale: conversion.isStale,
        rateTimestamp: conversion.fetchedAt,
    };
};

const createNewProduct = async (merchantId, baseCurrency, productData) => {
    const row = await createProduct({
        merchant_id: merchantId,
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        currency: baseCurrency,
        category: productData.category || null,
        image_url: productData.image_url || null,
    });
    return new Product(row).toJSON();
};

const updateExistingProduct = async (productId, merchantId, updateData) => {
    const row = await getProductById(productId);

    if (!row) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    if (row.merchant_id !== merchantId) {
        const error = new Error('You can only update your own products');
        error.statusCode = 403;
        throw error;
    }

    const updated = await updateProduct(productId, updateData);
    return new Product(updated).toJSON();
};

const deleteProduct = async (productId, merchantId) => {
    const row = await getProductById(productId);

    if (!row) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
    }

    if (row.merchant_id !== merchantId) {
        const error = new Error('You can only delete your own products');
        error.statusCode = 403;
        throw error;
    }

    const deleted = await softDeleteProduct(productId);
    return new Product(deleted).toJSON();
};

module.exports = {listProducts, getProduct, createNewProduct, updateExistingProduct, deleteProduct}