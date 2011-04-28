//This exports the public objects
//Backplane handlers


var Backplane = require('./backplane.js').Backplane;
exports.Backplane = Backplane; 

//Poller -- UNTESTED
exports.createBackplanePoller = require('./BackplanePoller.js');