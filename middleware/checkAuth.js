const jwt = require('jsonwebtoken');
const {constant} = require('./middleware.constants');
const { Auth_error } = constant;
// don't forget to add a secret KEY
const secretKey = process.env.SECRET_KEY || 'abcdefghijklmnopqrstuvwxyz1234567890';

module.exports = (req, res, next) => {

    try {
        const token = req.headers.Authorization || req.headers.authorization;
        const jwtData = {
            expiresIn: process.env.EXPIRES_IN,
        };
        const decoded = jwt.verify(token, secretKey, jwtData);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 0,
            message: Auth_error
        });
    }
};
