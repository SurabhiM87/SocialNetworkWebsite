var sql = require('mssql');
var q = require('q');

// Configuration variables
var config = require('../config');

var sqlConfig = {
    user: config.database.user,
    password: config.database.password,
    server: config.database.server,
    database: config.database.db,

    options: {
        encrypt: true,
        parseJSON: true
    }
}

module.exports = function(data, method) {
    var deferred = q.defer();
    var sqlConn = new sql.Connection(sqlConfig, function(err) {
        if(err){
            var msg = 'Can\'t connect to MS SQL server.';
            console.log(msg);
        }

        var sqlRequest = new sql.Request(sqlConn);

        if (typeof data == 'string'){
            sqlRequest.input('inputJSON', sql.VarChar(5000), data);
        } else if(typeof data == 'object'){
            for(var prop in data) {
                sqlRequest.input(prop, sql.VarChar(5000), data[prop]);
            }
        }

        sqlRequest.execute(method || 'spGetJSON', function(err, recordsets, returnValue) {
            if (err) {
                deferred.reject(err.message);
            }
            else{
                if (recordsets.length != 0){
                    try{
                        var json = JSON.parse(recordsets[0][0][''])
                        deferred.resolve(json);
                    } catch(e) {
                        deferred.reject(e);
                    }
                } else {
                    deferred.reject(new Error("No records from server."));
                }
            }
        });

    });
    return deferred.promise;
}

