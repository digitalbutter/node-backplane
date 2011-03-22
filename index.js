var backplane = require('./backplane/backplane.js');
var messages = require('./backplane/backplaneMessages.js');

exports.backplaneConnect = backplane.connectHandler;
exports.backplaneHandler = backplane.handler;
exports.createBackplanePoller = require('./backplane/BackplanePoller.js');
exports.messages = messages;