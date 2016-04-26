// get headers
var config = require('../config');

module.exports = function(response, content) {
    var header = {"Content-Type": "application/json"};

    if (config.allowHeaders.on){
        header["Access-Control-Allow-Origin"] = config.allowHeaders.domain;
        header["Access-Control-Allow-Credentials"] = true;
    }

    return header;
}

