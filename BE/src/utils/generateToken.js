const jwt = require('jsonwebtoken');

/**
 * Tạo JWT token cho người dùng
 * @param {string} userId - ID của người dùng
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });
};

module.exports = generateToken;