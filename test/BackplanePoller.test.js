var utils = require('utils.js');
var events = require('events');
var http = require('http');
var Trait = require('traits').Trait;

describe("BackplanePoller", function(){
    var BackplanePoller = require('BackplanePoller.js');

    describe("spawned object with ssl set to false",function(){
        var backplanePoller,
                clientSpy,
                bindSpy;

        beforeEach(function(){
            clientSpy = { request: function(){} };
            spyOn(http,'createClient').andReturn(clientSpy);
            spyOn(global,'setInterval');
            bindSpy = jasmine.createSpy().andReturn("bound function");
            spyOn(utils,'TBind').andReturn(Trait({ bind:bindSpy }));
            backplanePoller = BackplanePoller({interval: 100, busName: 'bus_name', base64AuthString: 'base64AuthStringYo', host: 'host url'},{ ssl: false});
        });

        it("should be an instance of EventEmitter", function(){
            expect(backplanePoller instanceof events.EventEmitter).toBeTruthy();
        });

        it("should create an http client",function(){
            expect(http.createClient).toHaveBeenCalledWith(80,'host url',false);
        });

        it("should set the client variable",function(){
            expect(backplanePoller.client).toEqual(clientSpy);
        });

        it("should call setInterval",function(){
            expect(bindSpy).toHaveBeenCalledWith(backplanePoller.getBusMessages);
            expect(global.setInterval).toHaveBeenCalledWith('bound function',100);
        });

        describe("getBusMessages function", function(){
            var requestSpy;

            beforeEach(function(){
                requestSpy = { end: function(){}, on: function(){} };
                spyOn(clientSpy,'request').andReturn(requestSpy);
                spyOn(requestSpy,'end');
                spyOn(requestSpy,'on');
                backplanePoller.getBusMessages();
            });

            it("should call the client", function(){
                expect(backplanePoller.client.request).toHaveBeenCalledWith('GET','/v1/bus/bus_name',{host: 'host url', authorization: 'Basic base64AuthStringYo'});
            });

            it("should call end",function(){
                expect(requestSpy.end).toHaveBeenCalled();
            });

            it("should call on",function(){
                expect(bindSpy).toHaveBeenCalledWith(backplanePoller.messageCallback);
                expect(requestSpy.on).toHaveBeenCalledWith('response','bound function');
            });

            describe("", function(){
                beforeEach(function(){
                    backplanePoller.lastMessageId = "some_previous_id";
                    backplanePoller.getBusMessages();
                });

                it("should call the client", function(){
                    expect(backplanePoller.client.request.mostRecentCall.args).toEqual(['GET','/v1/bus/bus_name?since=some_previous_id',{host: 'host url', authorization: 'Basic base64AuthStringYo'}]);
                });
            });

        });

        describe("messageCallback", function(){
            var mockResponse,
                    mockDataEvent;

            beforeEach(function(){
                mockResponse = {
                    setEncoding: jasmine.createSpy()
                    ,on: jasmine.createSpy()
                    ,end: jasmine.createSpy()
                };
                backplanePoller.messageCallback(mockResponse);
            });

            it("should set encoding to utf8", function(){
                expect(mockResponse.setEncoding).toHaveBeenCalledWith('utf8');
            });

            it("should add listener to data event first",function(){
                expect(mockResponse.on.argsForCall[0][0]).toEqual('data');
            });

            it("should add listener to end event after data event",function(){
                expect(mockResponse.on.argsForCall[1][0]).toEqual('end');
            });


            describe("pump data in twice and call end", function(){
                beforeEach(function(){
                    spyOn(backplanePoller,'parseResponse');
                    mockResponse.on.argsForCall[0][1]('I am some data');
                    mockResponse.on.argsForCall[0][1]('I am some more data');
                    mockResponse.on.argsForCall[1][1]();
                });

                it("should call the parseMessage function", function(){
                    expect(backplanePoller.parseResponse).toHaveBeenCalledWith('I am some dataI am some more data');
                });
            });
        });

        describe("parseResponse function", function(){
            describe("call with two messages", function(){
                var message1,
                        message2;

                beforeEach(function(){
                    message1 = {
                        id:"g2gDYgAABRBiAAg6JWIABsR9",
                        channel_name:"129630779291773510",
                        message: {
                            source:"http://api.js-kit.com",
                            type:"identity/logout",
                            payload:[]
                        }
                    };
                    message2 = {
                        id:"message_id",
                        channel_name:"ch_name",
                        message: {
                            source:"http://api.js-kit.com",
                            type:"session/ready",
                            payload: {
                                sessionId: "http://api.js-kit.com/v1/bus/digitalbutter/channel/129630779291773510"
                            }
                        }
                    };
                    spyOn(backplanePoller,'emit');
                    backplanePoller.parseResponse(JSON.stringify([message1,message2]));
                });

                it("should emit the first message", function(){
                    expect(backplanePoller.emit).toHaveBeenCalledWith('identity/logout', message1);
                });

                it("should emit the second message", function(){
                    expect(backplanePoller.emit).toHaveBeenCalledWith('session/ready',message2);
                });

                it("should save the last event id to the object",function(){
                    expect(backplanePoller.lastMessageId).toEqual("message_id");
                });
            });
            
            describe("call with empty array", function(){
                beforeEach(function(){
                    spyOn(backplanePoller,'emit');
                    backplanePoller.lastMessageId = "some_message_id";
                    backplanePoller.parseResponse(JSON.stringify([]));
                });

                it("should not emit anything", function(){
                    expect(backplanePoller.emit).not.toHaveBeenCalled();
                });

                it("should not change the message id",function(){
                    expect(backplanePoller.lastMessageId).toEqual("some_message_id");
                });
            });
            
        });
    });

    describe("spawned object with ssl set to true",function(){
        var backplanePoller;

        beforeEach(function(){
            spyOn(http,'createClient').andReturn('client return');
            backplanePoller = BackplanePoller({ host: 'bus url', ssl: true});
        });

        it("should create an http client",function(){
            expect(http.createClient).toHaveBeenCalledWith(443,'bus url',true);
        });

        it("should set the client variable",function(){
            expect(backplanePoller.client).toEqual('client return');
        });
    });
});
