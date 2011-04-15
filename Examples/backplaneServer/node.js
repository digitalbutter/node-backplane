// To test this example, edit the config.yml file (in features/) and chose "node.js" as the server
// Then run "cucumber features"


// This example uses regular node stuff
var http = require('http');
var sys = require('sys');

var Backplane = require('backplane').Backplane;

var port = 8001;

var backplaneHandler = (new Backplane()).handler();

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