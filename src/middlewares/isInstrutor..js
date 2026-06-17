const jwt = require("jsonwebtoken");

exports.isInstructor = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'instructor') {
        return res.status(403).json({ error: "Access denied. Only instructors can perform this action." });
    }

    next();
};