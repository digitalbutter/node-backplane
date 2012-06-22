// This example uses regular node
var http = require('http');
var util = require('util');
var fs = require("fs");

var Backplane;
try {
    Backplane = require('backplane').Backplane;
} catch(e){ // Case module is not installed, for tests.
    Backplane = require('../../lib/index.js').Backplane;
}


var port = 8001;


var secretFile = "./secrets.json"; // A list of Buses and secret key for authentication

var loadSecrets = function(secretFile){
    /**
     * Loads secret for connecting to a bus. As a matter of fact, also pop the buses
     */
    var secrets = {};
    var data= fs.readFileSync(secretFile,'utf8');
    try { secrets = JSON.parse(data).secrets} catch(err) { console.log(err) }
    return secrets
};


var parameters = {
    secrets : loadSecrets(secretFile)
};


var backplaneHandler = Backplane.spawn({parameters:parameters}).handler();

var handler = function(req,res){
    //Catch exceptions to return appropriate responses
    try {
        backplaneHandler(req,res);
    }
    catch(err){
        console.log(err.message);
        if(err.name === 'AuthenticationException'){
            res.writeHead(401, {"Content-Type": "text/plain"});
            res.end("");
        }
        else throw err;
    }
};

var server = http.createServer();
server.addListener("request", handler);
server.listen(port);
console.log("Listening on port: " + port);