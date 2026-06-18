const jwt = require('jsonwebtoken');
const { error } = require('../helpers/apiRespone');

exports.auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return error(res, 401, 'Access denied');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return error(res, 403, 'Invalid or expired token');
        }
        req.user = user;
        next();
    });
};
