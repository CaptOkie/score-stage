function isString(obj) {
    return typeof obj === 'string' || obj instanceof String;
}

module.exports = { 
    isString : isString
}