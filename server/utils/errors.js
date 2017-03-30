function error(msg, status) {
    var err = new Error(msg);
    err.status = status;
    return err;
}

module.exports.badRequest = function(msg) {
    return error(msg || 'Bad Request', 400);
};

module.exports.notFound = function(msg) {
    return error(msg || 'Not Found', 404);
};

module.exports.internalServerError = function(msg) {
    return error(msg || 'Internal Server Error', 500);
};

module.exports.conflict = function(msg) {
    return error(msg || 'Conflict', 409);
};

module.exports.unauthorized = function(msg) {
    return error(msg || 'Unauthorized', 401);
};

module.exports.forbidden = function(msg) {
    return error(msg || 'Forbidden', 403);
};