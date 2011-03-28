//This exports the public objects
//Backplane hadnlers


var Backplane = require('./backplane.js').Backplane;
exports.Backplane = Backplane; // When require()-d, you then need to instanciate the Backplane object.


/**
 * There is something fucked up with the scope if export them like that.
 * Better do this kind of soup in the scripts calling Backplane
 *
 *
 * exports.backplaneConnect = Backplane.connectHandler;
 * exports.backplaneHandler = Backplane.handler
 *
 *
 * var messages = require('./backplaneMessages.js');
 * exports.messages = messages;
 *
 * // I don't think we need to export this one anyway
 * var memoryMessageStore = require('./memoryMessageStore.js').memoryMessageStore;
 *
 */


//Poller -- UNTESTED
exports.createBackplanePoller = require('./BackplanePoller.js');