var url = require('url');
var utils = require('./utils.js');
var fs = require('fs');
var MemoryMessageStore = require("./memoryMessageStore.js").MemoryMessageStore;
if(typeof Class === 'undefined') Class = require('./Class.js').Class;

var Backplane = Class.extend({
/**
 * Handler for backplane server
 * @class Backplane
 * @param {object} parameters Parameters to pass to the server. Specify
 * <ul>
 *     <li>parameters.secrets A hash of bus:key. Buses will be created automatically. Secrets are used for POST authentication.</li>
 */
     parameters : {
        enumerable:true
    }

    
    ,init : function(){
        this.messageStore = new MemoryMessageStore();
        var entry;
        // Spawn buses for each entry
        for (var i in this.parameters.secrets){
            entry = this.parameters.secrets[i];
            this.messageStore.addBus(entry.bus)
        }
    }
    ,authHandler: function(bus,key){
        /**
         * Read the password, and compare it with the one in the secrets.json file
         * @method authHandler
         * @param {string} bus bus to interact with
         * @param {string} key secret key for this bus
         */
        var res;
        res = false;
        var entry;
        for (var i in this.parameters.secrets){
            entry = this.parameters.secrets[i];
            if (entry.bus == bus && entry.key == key){
                res = true
            }
        }
        return res;
    }
    ,decode64Handler: function(encodedString){
        throw { name: "Backplane: Option not set exception", message: "Backplane needs a base64 decoder to function." }
    }
    ,validate: function(request){
        //Check it is the Basic HTTP Authentication otherwise throw an exception
        var basicAuthRegex = /^Basic (.*)/;
        var result = basicAuthRegex.exec(request.headers.authorization);
        if(!result) {
            throw {
                name: "AuthenticationError"
                ,message: "This server only supports Basic authentication."
                ,authenticationHeader: request.headers.authorization
            }
        } else {

            //Check the result with the authentication handler
            var authStr = result[1];
            authStr = this.decode64Handler(authStr).split(':');
            return this.authHandler(authStr[0],authStr[1]);
        }
    }
    ,processGetBus : function(res,options){
        if(options.callback){
            return function(messageArray){
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.end(options.callback+"("+JSON.stringify(messageArray)+")");
            };
        } else {
            return function(messageArray){
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(messageArray));
            };
        }
    }
    ,processGetChannel : function(res,options){
        if(options.callback){
            return function(messageArray){
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.end(options.callback+"("+JSON.stringify(messageArray)+")");
            };
        } else {
            return function(messageArray){
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(messageArray));
            };
        }
    }
    ,processPost : function(req){
        req.content = "";
        return function(chunk){
            req.content += chunk;
        }
    }
    ,postEnd : function(request,response,bus,channel){
        var scope = this;

        return function(){
            try{
                scope.messageStore.save(bus,channel,request.content);
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.end();
            } catch (e){
                // Bad request
                response.writeHead(400, {"Content-Type":"text/plain"});
                response.end(JSON.stringify({error:{type:e.name,message:e.message,code:"400"}}));
            }
        }
    }
    ,handler : function(options){
        options = options || {};
        if(!options.decode64Handler) options.decode64Handler = require('base64').decode;

        utils.mergeOptions(this,['authHandler','decode64Handler','messageStore'],options);
        var scope = this;

        return function(req,res){
            var options = {};
            var param = url.parse(req.url,true).query;
            var paths = url.parse(req.url,true).pathname.split('/');
            var bus = paths[3], channel = paths[5];
            if(param.callback){
                options.callback = param.callback;
            }
            if (param.since){
                options.since = param.since;
            }

            switch(req.method){
                case "GET":
                    try {
                        if(channel) scope.messageStore.getChannelMessages(bus,channel,options,scope.processGetChannel(res,options));
                        else scope.messageStore.getBusMessages(bus,options,scope.processGetBus(res,options));
                    } catch (e) {
                        // Something went wrong.
                        res.writeHead(400, {"Content-Type":"text/plain"});
                        res.end(JSON.stringify({error:{type:e.name,message:e.message,code:"400"}}));
                    }
                    break;
                case "POST":
                    try{
                        if(scope.validate(req)){
                            req.addListener('data',scope.processPost(req));
                            req.addListener('end',scope.postEnd(req,res,bus,channel));
                        }
                        else{
                            // Invalid login/password
                            res.writeHead(401, {"Content-Type": "text/plain"});
                            res.end(JSON.stringify({error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}}));
                        }
                    } catch(e){
                        // Something went wrong.
                        res.writeHead(400, {"Content-Type":"text/plain"});
                        res.end(JSON.stringify({error:{type:e.name,message:e.message,code:"400"}}));
                    }
                    break;
                default:
                    throw "Method Not implemented";
            }
        };
    }
    ,connectHandler : function(options){
        var callback = this.handler(options);

        return function(req,res,next) {
            var urlRegex = /^\/v1\/bus\//;
            if(urlRegex.test(req.url)){
                callback(req,res);
            }
            else next();
        }
    }
});

exports.Backplane = Backplane;