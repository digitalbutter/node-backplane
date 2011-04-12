//This exports the public objects
//Backplane handlers


var Backplane = require('./backplane.js').Backplane;
exports.Backplane = Backplane; // When require()-d, you then need to instantiate the Backplane object.

//Poller -- UNTESTED
exports.createBackplanePoller = require('./BackplanePoller.js');