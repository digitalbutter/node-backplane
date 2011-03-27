//This exports the public objects
//Backplane hadnlers
var backplane = new (require('./backplane.js').Backplane)();
exports.backplaneConnect = backplane.connectHandler;
exports.backplaneHandler = backplane.handler;

//Messages
var messages = require('./backplaneMessages.js');
exports.messages = messages;

//Memory message store
var memoryMessageStore = require('./memoryMessageStore.js').memoryMessageStore;

//Poller
exports.createBackplanePoller = require('./BackplanePoller.js');