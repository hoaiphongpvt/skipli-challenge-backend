const jwt = require('jsonwebtoken');
const { error } = require('../helpers/apiRespone');

exports.isInstructor = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'instructor') {
        return error(
            res,
            403,
            'Access denied. Only instructors can perform this action'
        );
    }

    next();
};
