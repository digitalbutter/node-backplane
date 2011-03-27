var events = require('events');
var http = require('http');
var Trait = require('traits').Trait;
var utils = require('./utils.js');


function TBackplanePoller(host,busName,base64AuthString){
    return Trait.compose(
            utils.TBind(),
            Trait({
                //Properties
                client: null,
                lastMessageId: -1,

                //Method Properties
                getBusMessages: function(){
                    var path =  '/v1/bus/' + busName;
                    if(this.lastMessageId !== -1) path += "?since=" + this.lastMessageId;
                    var request = this.client.request('GET', path, {
                        host: host,
                        authorization: "Basic " + base64AuthString
                    });
                    request.end();
                    request.on('response',this.bind(this.messageCallback));
                },
                messageCallback: function(response){
                    response.setEncoding('utf8');

                    var responseData = "";
                    response.on('data', function(chunk){
                        responseData += chunk;
                    });

                    scope = this;
                    response.on('end', function(){
                        scope.parseResponse(responseData);
                    });
                },
                parseResponse: function(responseData){
                    var messages = JSON.parse(responseData);
                    if(messages.length){
                        for(var i = 0, len = messages.length; i < len; i++){
                            this.emit(messages[i].message.type, messages[i]);
                        }
                        this.lastMessageId = messages[len - 1].id;
                    }
                }
            }
                    ));
}

module.exports = function(config){
    var newPoller = Object.create(
            events.EventEmitter.prototype,
            Trait.compose(
                    TBackplanePoller(config.host,config.busName,config.base64AuthString),
                    Trait({
                        base64AuthString: config.base64AuthString,
                        busName: config.busName
                    })
                    )
            );

    //Setup the client
    if(config.ssl) newPoller.client = http.createClient(443,config.host,true);
    else newPoller.client = http.createClient(80,config.host,false);

    //Start polling and return the object
    setInterval(newPoller.bind(newPoller.getBusMessages),config.interval);
    return newPoller;
};