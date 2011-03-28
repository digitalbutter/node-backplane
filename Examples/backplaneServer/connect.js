// To test this example, edit the config.yml file (in features/) and chose "connect.js" as the server
// Then run "cucumber features"

// This example shows how backplane can be integrated with connect
var connect = require('connect'),
    jsonp = require('connect-jsonp');

var base64 = require('base64');

var backplane;
try {
    Backplane = require('backplane').Backplane; // If the package is installed on your system
} catch(err) {
    Backplane = require('./../../lib/index.js').Backplane; // Otherwise, direct link to the index file.
}

var port = 8001;

var server = module.exports = connect.createServer(
    connect.logger(),
    backplaneHandler = (new Backplane()).connectHandler({ decode64Handler: base64.decode })
);

server.listen(port);
console.log("Listening on port: " + port);