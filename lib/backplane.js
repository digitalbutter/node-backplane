var url = require('url');
var utils = require('./utils.js');

var MemoryMessageStore = require("./memoryMessageStore.js").MemoryMessageStore;


var Backplane = function(){
/**
 * @class backplane
 * Handler for backplane server
 * @param username
 * @param password
 */
};

Backplane.prototype.authHandler = function(username,password){
    throw { name: "Echo: Option not set exception", message: "Backplane needs an authentication callback to function." }
};

Backplane.prototype.decode64Handler = function(encodedString){
    throw { name: "Echo: Option not set exception", message: "Backplane needs a base64 decoder to function." }
};

Backplane.prototype.messageStore = new MemoryMessageStore();

Backplane.prototype.validate = function(request){
    //Check it is the Basic HTTP Authentication otherwise throw an exception
    var basicAuthRegex = /^Basic (.*)/;
    var result = basicAuthRegex.exec(request.headers.authentication);
    if(!result) throw {
        name: "AuthenticationException"
        ,message: "The backplane library only supports basic Authentication."
        ,authenticationHeader: request.headers.authentication
    };

    //Check the result with the authentication handler
    var authStr = result[1];
    authStr = this.decode64Handler(authStr).split(':');
    return this.authHandler(authStr[0],authStr[1]);
};

Backplane.prototype.processGetBus = function(res){
    return function(messageArray){
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(messageArray));
    };
};

Backplane.prototype.processGetChannel = function(res){
    return function(messageArray){
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(messageArray));
    };
};

Backplane.prototype.processPost = function(req){
    req.content = "";
    return function(chunk){
        req.content += chunk;
    };
};

Backplane.prototype.postEnd = function(request,response,bus,channel){
    var res = response;

    return function(){
        this.messageStore.save(bus,channel,request.content);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end();
    }
};

Backplane.prototype.handler = function(options){
    utils.mergeOptions(this,['authHandler','decode64Handler','messageStore'],options);

    return function(req,res){
        var paths = url.parse(req.url).pathname.split('/');
        var bus = paths[3], channel = paths[5];

        switch(req.method){
            case "GET":
                if(channel) this.messageStore.getChannelMessages(bus,channel,this.processGetChannel(res));
                else this.messageStore.getBusMessages(bus,this.processGetBus(res));
                break;
            case "POST":
                if(this.validate(req)){
                    req.addListener('data',this.processPost(req));
                    req.addListener('end',this.postEnd(req,res,bus,channel));
                }
                else{
                    res.writeHead(401, {"Content-Type": "text/plain"});
                    res.end("Wrong username and/or password.");
                }
                break;
            default:
                throw "Method Not implemented";
        }
    };
};

Backplane.prototype.connectHandler = function(options){
    callback = this.handler(options);

    return function(req,res,next) {
        var urlRegex = /^\/v1\/bus\//;
        if(urlRegex.test(req.url)){
            callback(req,res);
        }
        else next();
    }
};

exports.Backplane = Backplane;