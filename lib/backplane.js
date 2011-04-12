var url = require('url');
var utils = require('./utils.js');
var fs = require('fs');
var MemoryMessageStore = require("./memoryMessageStore.js").MemoryMessageStore;
var crypto = require("crypto");


var Backplane = function(){
/**
 * Handler for backplane server
 * @class Backplane
 */
};


Backplane.prototype.loadSecrets = function(secrets){
    /**
     * Loads secret for connecting to a bus. As a matter of fact, also pop the buses
     * @method loadSecrets
     * @param {file} secrets json file containing bus/secrets, default secrets.json
     */
    if(!secrets){
        data= fs.readFileSync("./secrets.json",'utf8');
        try { this.secrets = eval(data)} catch(err) { console.log(err) }

    } else {
        data= fs.readFileSync(secrets,'utf8');
        try { this.secrets = eval(data)} catch(err) { console.log(err) }
    }

    // Creates buses for each entry
    for (var i in this.secrets){
        entry = this.secrets[i];
        this.messageStore.addBus(entry.bus)
    }
};

Backplane.prototype.authHandler = function(bus,key){
    /**
     * Read the password, and compare it with the one in the secrets.json file
     * @method authHandler
     * @param {string} bus bus to interact with
     * @param {string} key secret key for this bus
     */
    var entry;
    for (var i in this.secrets){
        entry = this.secrets[i];
        if (entry.bus == bus){
            return entry.key == key
        }
    }
    return false;
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
    }
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
    var scope = this

    return function(){
        scope.messageStore.save(bus,channel,request.content);
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end();
    }
};

Backplane.prototype.handler = function(options){
    utils.mergeOptions(this,['authHandler','decode64Handler','messageStore'],options);
    this.loadSecrets();
    var scope = this;

    return function(req,res){
        var paths = url.parse(req.url).pathname.split('/');
        var bus = paths[3], channel = paths[5];
        var options = {};
        if (req.headers.since){
            options.since = req.headers.since
        }
        
        switch(req.method){
            case "GET":
                if(channel) scope.messageStore.getChannelMessages(bus,channel,options,scope.processGetChannel(res));
                else scope.messageStore.getBusMessages(bus,options,scope.processGetBus(res));
                break;
            case "POST":
                if(scope.validate(req)){
                    req.addListener('data',scope.processPost(req));
                    req.addListener('end',scope.postEnd(req,res,bus,channel));
                }
                else{
//                    res.writeHead({error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}});
                    res.writeHead(401, {"Content-Type": "text/plain"});

                    res.end(JSON.stringify({error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}}));
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