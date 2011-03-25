describe("memoryMessageStore ", function(){
    describe("Store class", function(){

        var MMS  = require("backplane/memoryMessageStore.js").store;
        describe("create a bus",function(){
            it("should create a valid bus",function(){
                MMS.addBus("valid_bus");
                expect(MMS.isValidBus("valid_bus")).toBe(true);
            });

            describe("create channel on top of an existing bus",function(){

                it("should have created an empty valid channel on top of the valid bus",function(){
                    MMS.addChannel("valid_bus","valid_channel");
                    expect(MMS.isValidChannel("valid_bus","valid_channel")).toBe(true)
                    expect(MMS.content["valid_bus"]["valid_channel"].len()).toBe(0);
                });
                it("should have a name",function(){
                    expect(MMS.content["valid_bus"]["valid_channel"].channel_name).toEqual("valid_channel");
                });

                describe("add data to an existing channel",function(){
                    describe("pushing a first message",function(){
                        it("should change the length of the channel to 1",function(){
                            MMS.pushMessage("valid_bus","valid_channel","I am Content #1");
                            expect(MMS.content["valid_bus"]["valid_channel"].len()).toBe(1);
                        });

                        it("should have appended the proper message to the bus",function(){
                            expect(MMS.content["valid_bus"]["valid_channel"].content[0].message).toBe("I am Content #1");
                        });

                        describe("pushing more messages",function(){
                            it("should be full", function(){
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #2");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #3");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #4");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #5");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #6");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #7");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #8");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #9");
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #10");
                                expect(MMS.content["valid_bus"]["valid_channel"].len()).toBe(10);
                            });

                            it("should still be full",function(){
                                MMS.pushMessage("valid_bus","valid_channel","I am Content #11")
                                expect(MMS.content["valid_bus"]["valid_channel"].len()).toBe(10);
                            });

                            it("should have removed the first entry",function(){
                                expect(MMS.content["valid_bus"]["valid_channel"].content[0].message).toBe("I am Content #2");
                                expect(MMS.content["valid_bus"]["valid_channel"].content[9].message).toBe("I am Content #11");
                            })

                            it("entries should have different ids",function(){
                                id1 = MMS.content["valid_bus"]["valid_channel"].content[0].id;
                                id2 = MMS.content["valid_bus"]["valid_channel"].content[1].id;
                                expect(id1).not.toEqual(id2);
                            })
                            describe("updating the size of the channel",function(){
                                it("should clean some messages (last message should stay last",function(){
                                    MMS.content["valid_bus"]["valid_channel"].new_maxsize(5);
                                    expect(MMS.content["valid_bus"]["valid_channel"].maxsize).toBe(5);
                                    expect(MMS.content["valid_bus"]["valid_channel"].len()).toBe(5);
                                    index = MMS.content["valid_bus"]["valid_channel"].len()-1
                                    expect(MMS.content["valid_bus"]["valid_channel"].content[index].message).toBe("I am Content #11");
                                })
                            })
                        })
                    })
                })
            })
        });
    });

    describe("push message",function(){
        var MMS = require("backplane/memoryMessageStore.js");

        describe("to existing channel",function(){
            beforeEach(function(){
                spyOn(MMS,'validate').andReturn(true);
                MMSS = MMS.store;
                spyOn(MMSS,"pushMessage");
                MMS.save("valid_bus","valid_channel","valid_content")
            });

            it("should check the message",function(){
                expect(MMS.validate).toHaveBeenCalled();
            });
            it("should push the message to the channel",function(){
                expect(MMSS.pushMessage).toHaveBeenCalledWith("valid_bus","valid_channel","valid_content")
            })
        });

        describe("to non-existing channel",function(){
            beforeEach(function(){
                spyOn(MMS,'validate').andReturn(true);
                MMSS = MMS.store;
                spyOn(MMSS,"pushMessage");
                spyOn(MMSS,"addChannel");
                MMS.save("valid_bus","invalid_channel","valid_content")
            });
            it("should create the channel",function(){
                expect(MMSS.addChannel).toHaveBeenCalledWith("valid_bus","invalid_channel");
            })
            it("should post the message",function(){
                expect(MMSS.pushMessage).toHaveBeenCalledWith("valid_bus","invalid_channel","valid_content")
            })
        });

        describe("to non-existing bus",function(){
            beforeEach(function(){
                spyOn(MMS,'validate').andReturn(true);
                MMSS = MMS.store;
            });
            it("should raise and exception",function(){
                expect(function(){ MMS.save("invalid_bus","invalid_channel","valid_content") }).toThrow({name: "Invalid bus exception", message: "Can't push to non-existing bus"});
            })
        })
    });

    describe("validate message",function(){
        MMS  = require("backplane/memoryMessageStore.js");
        describe("valid message",function(){

            it("should return true",function(){
                message = {source:"http://source.com",type:"regular",payload:{author:"Bob",comment:"This is comment!"}};
                expect(MMS.validate(message)).toBe(true);
            })

        });
        describe("invalid message",function(){
            it("should return false",function(){
                message = {source:"a a source.com",type:"regular",payload:{author:"Bob",comment:"This is comment!"}};
                expect(function(){MMS.validate(message)}).toThrow({name: "Invalid Message Exception",message:"source must be a valid URL"});

            })
        })

    });

    describe("getChannelMessage",function(){
        var MMS = require("backplane/memoryMessageStore.js");
        describe("from a valid bus/channel",function(){
            it("should call the getChannelMessages method from the Store",function(){
                spyOn(MMS.store,"getChannelMessages")
                callback = function(){};
                messages = MMS.getChannelMessages("valid_bus","valid_channel",null,callback);
                expect(MMS.store.getChannelMessages).toHaveBeenCalledWith("valid_bus","valid_channel",null);
            })
            it("should call the callback",function(){
                var callback = { callback: function(){}}
                spyOn(callback,"callback")
                messages = MMS.getChannelMessages("valid_bus","valid_channel",null,callback.callback);
                expect(callback.callback).toHaveBeenCalled();
                res = callback.callback.mostRecentCall.args;
                expect(res[0][0].id).toBe(6); // first message id : 6.
            })
            describe("with a \"since\" parameter",function(){
                it("should return proper messages",function(){
                    var callback = { callback: function(){}}
                    spyOn(callback,"callback");
                    option = { since: 7 };
                    messages = MMS.getChannelMessages("valid_bus","valid_channel",option,callback.callback);
                    expect(callback.callback).toHaveBeenCalled();
                    res = callback.callback.mostRecentCall.args;
                    expect(res[0][0].id).toBe(8); // first message id : 8
                })
            })
        })
        describe("from an invalid bus/channel",function(){
            it("should call the callback with an error",function(){
                var callback = { callback: function(){}}
                spyOn(callback,"callback");
                messages = MMS.getChannelMessages("invalid_bus","valid_channel",null,callback.callback);
                expect(callback.callback).toHaveBeenCalledWith(null,{ name: "Invalid bus/channel exception", message: "Attempt to read an invalid bus/channel"});
            })
        })

    });

    describe("getBusMessage",function(){
        var MMS = require("backplane/memoryMessageStore.js");
        describe("from a valid bus",function(){
            it("should call the callback with messages",function(){
                var callback = { callback:function(){} };
                spyOn(callback,"callback");
                messages = MMS.getBusMessages("valid_bus",null,callback.callback);
                expect(callback.callback).toHaveBeenCalled();
                res = callback.callback.mostRecentCall.args;
                expect(res[0][0].id).toBe(6); // first message id : 6.
            })
            describe("with a since parameter",function(){
                it("should call the callback with messages",function(){
                    var callback = { callback:function(){} };
                    spyOn(callback,"callback");
                    messages = MMS.getBusMessages("valid_bus",{since:7},callback.callback);
                    expect(callback.callback).toHaveBeenCalled();
                    res = callback.callback.mostRecentCall.args;
                    expect(res[0][0].id).toBe(8); // first message id : 8.
                })
            })
        });
        describe("from an invalid bus",function(){
            it("should call the callback with errors",function(){
                var callback = { callback:function(){} };
                spyOn(callback,"callback");
                messages = MMS.getBusMessages("invalid_bus",null,callback.callback);
                expect(callback.callback).toHaveBeenCalledWith(null,{ name: "Invalid bus exception", message: "Attempt to read an invalid bus"})
            })
        })
    });

    describe("deleting channel",function(){
        var MMS = require("backplane/memoryMessageStore.js");
        it("should make the channel invalid",function(){
            expect(MMS.store.isValidChannel("valid_bus","valid_channel")).toBe(true);
            MMS.delChannel("valid_bus","valid_channel");
            expect(MMS.store.isValidChannel("valid_bus","valid_channel")).toBe(false);
        })
    });

    describe("deleting bus",function(){
        it("should make the bus invalid",function(){
            expect(MMS.store.isValidBus("valid_bus")).toBe(true);
            MMS.delBus("valid_bus");
            expect(MMS.store.isValidBus("valid_bus")).toBe(false)
        })
    })
});
