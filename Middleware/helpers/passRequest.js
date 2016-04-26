// pass request

var config = require('../config');
var getHeaders = require('./getHeaders');

module.exports = function(response, content) {
    response.writeHead(200, getHeaders());
    response.end(content);
}

