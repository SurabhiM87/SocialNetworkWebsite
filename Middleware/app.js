// Load all the sweet libs we need
var https = require('https');
var http = require('http');
var url = require('url') ;
var sessions = require('client-sessions');
var express = require('express');
var app = express();
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');
var fs = require('fs');
var crypto = require( "crypto" );
var compress = require('compression');



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
app.use(compress());

// Define public methods
var publicMethods = [
    'auth',
    'deauth',
    'userCreate',
    'userConfirm',
    'userRequestResetPassword',
    'userResetPassword'
];

//parse image urls
function findImage(data,result){
    if(data.hasOwnProperty('type') && data.type=="image"){
        result.push(data);
    }

    for(var i=0;i<Object.keys(data).length;i++){
        if(typeof data[Object.keys(data)[i]]=="object" && data[Object.keys(data)[i]]!= null){
            findImage(data[Object.keys(data)[i]],result);
        }
    }
}

function s3ImageParse(data){
    var results = [];
    findImage(data, results);

    results.forEach(function(value, index) {
        if (new Date(value.exp) <= new Date()){
            console.log('expired token');

            var s3 = new AWS.S3();
            var params = {Bucket: config.aws.butcketName, Key: value.bucketPath, Expires: 60};
            var url = s3.getSignedUrl('getObject', params);
            value.src = url;
            // async back to bob the key and calculated exp
        }

        //remove stuff clients done need
        delete value.exp;
        delete value.imageId;
        delete value.bucketPath;
        delete value.type;
    });

    return data;
}

//parse image urls
function findUpload(data,result){
    if(data.hasOwnProperty('type') && data.type=="upload"){
        result.push(data);
    }

    for(var i=0;i<Object.keys(data).length;i++){
        if(typeof data[Object.keys(data)[i]]=="object" && data[Object.keys(data)[i]]!= null){
            findUpload(data[Object.keys(data)[i]],result);
        }
    }
}

function s3UploadParse(data){
    var results = [];
    findUpload(data, results);


    results.forEach(function(value, index) {
        var s3 = new AWS.S3();

        var params = {
            Bucket: config.aws.bucketName,
            Key: value.bucketPath+value.bucketFile,
            Expires: 60,
            ContentType: value.fileType,
            ACL: 'private'
        }

        value.signedUrl = s3.getSignedUrl('putObject', params);

        delete params.ACL;
        delete params.ContentType;
        value.viewUrl = s3.getSignedUrl('getObject', params);

        //remove stuff clients done need ;
        delete value.fileName;
        delete value.bucketFile;
        delete value.bucketPath;
        delete value.contentType;
        delete value.type;
    });
}

function addStatus(data, msg){
    if (typeof data.status == 'undefined'){
        data.status = msg;
    }
}

function sessionParse(data, request, method){
    for (var i =0; i < data.length; i++){
        if (typeof data[i].sessionId != 'undefined'){
            var sessionId = data[i].sessionId;
            if (sessionId != '' && sessionId != null) {
                request.session_state.sessionId = sessionId;
                addStatus(data[i], 'OK');
            } else if (sessionId == null && method != 'deauth'){
                request.session_state.reset();
                addStatus(data[i], 'FAIL');
            } else {
                request.session_state.reset();
                addStatus(data[i], 'OK');
            }
            delete data[i].sessionId;
        }
    }
}

function removeLineBreaks(data){
    if(typeof data == "string"){
        return data.replace(/\r?\n/g, "<br/>");
    }

    for(var i=0;i<Object.keys(data).length;i++){
        if(typeof data[Object.keys(data)[i]]=="object" && data[Object.keys(data)[i]]!= null){
            data[Object.keys(data)[i]] = removeLineBreaks(data[Object.keys(data)[i]]);
        }
    }
    return data;
}

// App routes
app.get('/favicon.ico', function (request, response) {
    response.writeHead(200, {'Content-Type': 'image/x-icon'} );
    response.end();
})

app.all('/', function (request, response) {

    var dataObj;
    // check for querystring
    try{
        dataObj = JSON.parse(url.parse(request.url,true).query['data']);
    } catch (e){
        failRequest(response);
        return;
    }

    // log all methods
    console.log('[%s] Called method: %s', request.connection.remoteAddress, dataObj.ajax)

    // check good requests
    if (typeof request.session_state.sessionId != 'undefined' || publicMethods.indexOf(dataObj.ajax) > -1) {
        // Add session info
        if (typeof request.session_state.sessionId != 'undefined' ){
            dataObj.sessionId = request.session_state.sessionId;
        }

        // Add body params
        for(var i=0;i<Object.keys(request.body).length;i++){
            var data = removeLineBreaks(request.body[Object.keys(request.body)[i]]);
            dataObj[Object.keys(request.body)[i]] = data;
        }

        getJson(JSON.stringify(dataObj)).then(function(val){
            try{
                s3ImageParse(val);
                s3UploadParse(val);
                sessionParse(val, request, dataObj.ajax);
                passRequest(response, JSON.stringify(val));
            } catch (e){
                console.log(e);
                failRequest(response);
            }
        }).fail(function(e){
            console.log(e);
            failRequest(response);
        })
    } else {
        failRequest(response);
    }
});

// Startup Server
if (config.http.on){
    var server = app.listen(80, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log("MMR Middleware listening at http://%s:%s", host, port);
    });
} else {
    // Redirect from http port 80 to https
    var httpServer = http.createServer(function (req, res) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        res.end();
    }).listen(80, function(){
        var host = httpServer.address().address;
        var port = httpServer.address().port;
        console.log("MMR Middleware listening at https://%s:%s and forwarding to https", host, port);
    });
}

//setup SSL
if (config.ssl.on){
    var privateKey = fs.readFileSync(config.ssl.privateKey).toString();
    var certificate = fs.readFileSync(config.ssl.certificate).toString();
    var credentials = {key: privateKey, cert: certificate};

    var httpsServer = https.createServer(credentials, app).listen(443, function(){
        var host = httpsServer.address().address;
        var port = httpsServer.address().port;
        console.log("MMR Middleware listening at https://%s:%s", host, port);
    });
}
