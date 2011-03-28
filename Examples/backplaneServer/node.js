// To test this example, edit the config.yml file (in features/) and chose "node.js" as the server
// Then run "cucumber features"


// This example uses regular node stuff
var http = require('http');
var base64 = require('base64');
var sys = require('sys');


var backplane;
try {
    Backplane = require('backplane').Backplane; // If the package is installed on your system
} catch(err) {
    Backplane = require('./../../lib/index.js').Backplane; // Otherwise, direct link to the index file.
}

var port = 8001;

var backplaneHandler = (new Backplane()).handler({ decode64Handler: base64.decode });

var handler = function(req,res){
    //Catch exceptions to return appropriate responses
    try{
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