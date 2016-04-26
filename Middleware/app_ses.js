// Load all the sweet libs we need
var https = require('https');
var http = require('http');
var sessions = require('client-sessions');
var express = require('express');
var app = express();
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');
var fs = require('fs');
var crypto = require( "crypto" );

// Load Config File
var config = require('./config');

// Load Helpers
var getJson = require("./helpers/getJSON");
var failRequest = require("./helpers/failRequest");
var passRequest = require("./helpers/passRequest");
console.log = require("./helpers/log");

app.use(sessions({secret: config.sessions.secret}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// App routes
app.get('/favicon.ico', function (request, response) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'} );
    response.end();
})

app.all('/', function (request, response) {
    console.log('[%s] Called method: %s', request.connection.remoteAddress, 'ses');

     passRequest(response, JSON.stringify({"status":"OK"}));
});

// Startup Server
if (config.http.on){
    var server = app.listen(81, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log("MMR SES Endpoint listening at http://%s:%s", host, port);
    });
} else {
    // Redirect from http port 80 to https
    var httpServer = http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(81, function(){
        var host = httpServer.address().address;
        var port = httpServer.address().port;
        console.log("MMR SES Endpoint listening at https://%s:%s and forwarding to https", host, port);
    });
}

//setup SSL
if (config.ssl.on){
    var privateKey = fs.readFileSync(config.ssl.privateKey).toString();
    var certificate = fs.readFileSync(config.ssl.certificate).toString();
    var credentials = {key: privateKey, cert: certificate};

    var httpsServer = https.createServer(credentials, app).listen(444, function(){
        var host = httpsServer.address().address;
        var port = httpsServer.address().port;
        console.log("MMR SES Endpoint listening at https://%s:%s", host, port);
    });
}
