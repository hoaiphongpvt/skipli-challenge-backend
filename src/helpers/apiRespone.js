exports.success = (res, data = null, statusCode = 200, message = 'success') => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

exports.error = (res, statusCode, message = 'error', error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error,
    });
};
