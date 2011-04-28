// Run a backplane server with Connect
var connect = require('connect');
var fs = require("fs");
var Backplane = require('backplane').Backplane;

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

var server = module.exports = connect.createServer(
    connect.logger(),
    backplaneHandler = Backplane.spawn({parameters:parameters}).connectHandler()
);

server.listen(port);
console.log("Listening on port: " + port);