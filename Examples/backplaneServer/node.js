var http = require('http');
var base64 = require('base64');

var sys = require('sys');

var backplane = require('./../../lib/index.js');

var port = 8001;

var authenticationHandler = function(username,password){
    return username === 'valid_bus' && password === 'valid_key';
};


// This has been implemented, we should not need it anymore.
var messageStore = {
    valid_bus: {}
    ,checkChannel: function(channel){
        if(!messageStore.valid_bus[channel]) messageStore.valid_bus[channel] = [];
    }
    ,save: function(bus,channel,message){
        console.log('bus:' + bus + " ,channel: " + channel + " ,message: " + message);
        messageStore.checkChannel(channel);
        messageStore.valid_bus[channel].push(message);
    }
    ,getChannelMessages: function(bus, channel,callback){
        console.log('getChannel: ' + channel);
        console.log(messageStore.valid_bus[channel]);
        messageStore.checkChannel(channel);
        callback(messageStore.valid_bus[channel]);
    }
    ,getBusMessages: function(bus,callback){
        var messages = [];
        for(var channel in messageStore.valid_bus){
            messages = messages.concat(messageStore.valid_bus[channel]);
        }
        callback(messages);
    }
};

//Setup the backplaneHandler
var backplaneHandler = backplane.backplaneHandler({ authHandler: authenticationHandler, decode64Handler: base64.decode });

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