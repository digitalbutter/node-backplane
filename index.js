var backplane = require('./lib/backplane/backplane.js');
var messages = require('./lib/backplane/backplaneMessages.js');

exports.backplaneConnect = backplane.connectHandler;
exports.backplaneHandler = backplane.handler;
exports.createBackplanePoller = require('./lib/backplane/BackplanePoller.js');
exports.messages = messages;