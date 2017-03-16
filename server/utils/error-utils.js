function error(msg, status) {
    var err = new Error(msg);
    err.status = status;
    return err;
}

function badRequest(msg) {
    return error(msg || 'Bad Request', 400);
}

function notFound(msg) {
    return error(msg || 'Not Found', 404);
}

module.exports = {
    badRequest : badRequest,
    notFound : notFound
}