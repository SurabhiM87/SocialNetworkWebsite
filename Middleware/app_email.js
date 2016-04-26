// Load all the sweet libs we need
var sql         = require('mssql'),
    q           = require('q'),
    handlebars  = require('handlebars'),
    layouts     = require('handlebars-layouts'),
    juice       = require('juice'),
    fs          = require('fs'),
    aws         = require('aws-sdk'),
    ses         = new aws.SES({apiVersion: '2010-12-01',region: 'us-east-1'});

// Load Config File
var config = require('./config');

// Register helpers
handlebars.registerHelper(layouts(handlebars));

// Load Helpers
var getJson = require("./helpers/getJSON");
var checkInterval = config.email.checkInterval;
console.log = require("./helpers/log");

// Thead manager
var count = 0;

// Send mail
function sendMail(emailData, keepGoing){
    try{
        // Register partials
        handlebars.registerPartial('layout', fs.readFileSync('./emailTemplates/master.hbs', 'utf8'));

        // Load Emails
        var source = fs.readFileSync('./emailTemplates/'+emailData.templateId+'/html.hbs').toString();
        var htmlTemplate = handlebars.compile(source);
        var data = JSON.parse(emailData.bodyJson);

        //load global vars
        for(var param in config.email.globalVariables ) {
            data[param] = config.email.globalVariables[param];
        }

        var htmlBody = juice(htmlTemplate(data));
    } catch(err){
        console.dir(err);
        if (keepGoing){
            count --;
            if (count ==0 ) {
                checkAgain();
            }
            return;
        }else{
            process.exit()
        }
    }

    ses.sendEmail({
        "Source": emailData.fromAddress,
        "Destination": { /* required */
            "ToAddresses": [ emailData.toAddress ]
        },
        "Message":{
            "Subject": {
                "Data": emailData.subject,
                "Charset": "UTF-8"
            },
            "Body": {
                "Html": {
                    "Data": htmlBody,
                    "Charset": "UTF-8"
                }
            }
        }
    },
    function(err, data) {
        if (err){
            console.dir(err);
            if (keepGoing){
                count --;
                if (count ==0 ) {
                    checkAgain();
                }
            } else{
                process.exit()
            }
        } else {
            console.log('Email sent to "%s".', emailData.toAddress);
            console.log('Confirmation #: ' + data.MessageId);

            if (keepGoing){
                getJson({"emailId":emailData.emailId, "confirmation": data.MessageId}, 'spSetEmailConfirmation').then(function(val2){
                    count --;
                    if (count == 0 ) {
                        checkAgain();
                    }
                }).fail(function(e){
                    count --;
                    if (count ==0 ) {
                        checkAgain();
                    }
                    console.dir(e)
                });
            }else{
                process.exit()
            }
        }
    });
}


// check again
function checkAgain(){
    console.log('Checking again in %s second(s).', checkInterval);
    setTimeout(checkEmail, checkInterval * 1000);
}

// Startup Service
function checkEmail(){
    console.log('Checking for emails.')

    getJson(undefined, 'spGetPendingEmails').then(function(val){
        if (val === null){
            console.log('No emails found.');
            checkAgain();
        } else {
            console.log('%s emails found.', val.length);

            for (var i = 0; i < val.length; i++){
                count++;
                (function(data){
                    sendMail(data, true)
                }(val[i]));
            }
        }

    }).fail(function(e){
        checkAgain();
    });
}

var args = process.argv.slice(2);

// start monitoring
if (args.length == 0){
    checkEmail();
} else {
    if (args[0] == 'testEmail'){
        var emailId = args[1] || 1;
        var toEmail = args[2] || 'ricardo@mmrdigitalllc.com';
        var bodyJson = args[3] || '{}';

        console.log('Testing Email #: %s', emailId);
        sendMail({
            templateId: emailId,
            fromAddress: 'ricardo@mmrdigitalllc.com',
            toAddress: toEmail,
            subject: 'Testing Email #: '+emailId,
            bodyJson: bodyJson
        }, false);
    } else {
        console.log('Error: Unknown arguments.')
    }
}
