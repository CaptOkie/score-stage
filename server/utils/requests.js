const HTML = 'html';
const JSON = 'json';
const REQ_TYPES = [ HTML, JSON ];

function isType(req, type) {
    return req.accepts(REQ_TYPES) === type;    
}

module.exports.isHtml = function(req) {
    return isType(req, HTML);
};

module.exports.isJson = function(req) {
    return isType(req, JSON);
};

function isMethod(req, type) {
    return req.method === type;
}

module.exports.isGet = function(req) {
    return isMethod(req, 'GET');
};