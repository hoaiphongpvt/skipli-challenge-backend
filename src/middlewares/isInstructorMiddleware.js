const jwt = require('jsonwebtoken');
const { error } = require('../helpers/apiRespone');

exports.isInstructor = (req, res, next) => {
    const token = req.cookies.accessToken;

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
