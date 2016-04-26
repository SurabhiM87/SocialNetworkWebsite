// fail request

var config = require('../config');
var getHeaders = require('./getHeaders');

module.exports = function(response, content) {
    response.writeHead(403, getHeaders());
    response.end(JSON.stringify({"status":"fail", "code":"403"}));
}

