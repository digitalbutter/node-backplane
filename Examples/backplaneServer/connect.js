// Run a backplane server with Connect
var connect = require('connect');
var Backplane = require('backplane').Backplane;

var port = 8001;

var server = module.exports = connect.createServer(
    connect.logger(),
    backplaneHandler = (new Backplane()).connectHandler()
);

server.listen(port);
console.log("Listening on port: " + port);