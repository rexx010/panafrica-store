const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { findUserByEmail, createUser} = require('./auth.repository');
const User = require('./auth.model');

const register = async ({email, password, full_name, role, country, base_currency}) => {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        const error = new Error('Email already used');
        error.statusCode = 409;
        throw error;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const newUserRow = await createUser({
        email,
        password_hash,
        full_name,
        role,
        country,
        base_currency,
    });

    const user = new User(newUserRow);

    const token = generateToken(user);

    return {user: user.toJSON(), token};
};

const login = async ({email, password}) => {
    const userInfo = await findUserByEmail(email);

    if (!userInfo) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const passwordCheck = await bcrypt.compare(password, userInfo.password_hash);
    if(!passwordCheck){
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const user = new User(userInfo);
    const token = generateToken(user);
    return { user: user.toJSON(), token};
};

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            country: user.country,
            baseCurrency: user.baseCurrency,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: user.role === 'merchant' ? '7d' : '24h',
        }
    );
};

module.exports = { register, login };