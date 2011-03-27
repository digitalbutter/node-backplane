var store; // To test the Store class
var channel; // To test the Channel class
var MMS; // To test the memoryMessageStore class
var callback ; // To define dummy callback

describe("Channel class",function(){
    beforeEach(function(){
        channel = new (require("memoryMessageStore.js").Channel)("valid_channel");
    })
    describe("initialized",function(){
        it("should have a length of 0",function(){
            expect(channel.len()).toBe(0)
        });
        it("should have no content",function(){
            expect(channel.content).toEqual([])
        });
        it("should have a maxsize of 10",function(){
            expect(channel.maxsize).toEqual(10);
        });
        it("should have the name valid_channel",function(){
            expect(channel.channel_name).toEqual("valid_channel")
        });
        describe("pushMessage",function(){
            beforeEach(function(){
                channel.pushMessage("THIS IS MESSAGE!",0)
            });
            it("should have updated the size of the channel",function(){
                expect(channel.len()).toBe(1);
            })
            it("should have append the proper content",function(){
                expect(channel.content[0]).toEqual({message:"THIS IS MESSAGE!",channel_name:"valid_channel",id:0})
            })
            describe("pushMessage, more",function(){
                beforeEach(function(){
                    channel.pushMessage("THIS IS MESSAGE!",1);
                    channel.pushMessage("THIS IS MESSAGE!",2);
                    channel.pushMessage("THIS IS MESSAGE!",3);
                    channel.pushMessage("THIS IS MESSAGE!",4);
                    channel.pushMessage("THIS IS MESSAGE!",5);
                    channel.pushMessage("THIS IS MESSAGE!",6);
                    channel.pushMessage("THIS IS MESSAGE!",7);
                    channel.pushMessage("THIS IS MESSAGE!",8);
                    channel.pushMessage("THIS IS MESSAGE!",9);
                });
                it("should contain 10 messages",function(){
                    expect(channel.len()).toEqual(10);
                });
                it("should contain ordered message (FIFO)",function(){
                    for (var i = 0; i < 10 ; i++){
                        expect(channel.content[i].id).toBe(i)
                    }
                });
                describe("pushMessage, a bit more",function(){
                    beforeEach(function(){
                        channel.pushMessage("THIS IS MESSAGE!",11);
                        channel.pushMessage("THIS IS MESSAGE!",12);
                    });
                    it("should still contain 10 message",function(){
                        expect(channel.len()).toEqual(10);
                    });
                    it("first id should be 2",function(){
                        expect(channel.content[0].id).toBe(2)
                    });
                    it("last id should be 12",function(){
                        index = channel.maxsize-1
                        expect(channel.content[index].id).toBe(12)
                    })
                })
            })
        })
        describe("updateMaxSize",function(){
            beforeEach(function(){
                // Let's fill the channel with some messages
                for(var i = 0; i < 10 ; i++){
                    channel.pushMessage("THIS IS MESSAGE!",i)
                }
            })
            it("should contain 10 elements before",function(){
                expect(channel.len()).toEqual(10)
            })
            describe("apply updateMaxSize",function(){
                beforeEach(function(){
                    channel.updateMaxSize(5)
                })
                it("should contain 5 elements now",function(){
                    expect(channel.len()).toEqual(5);
                })
                it("should pop id:9 for the last element, id:5 for the first",function(){
                    expect(channel.content[0].id).toEqual(5)
                    index = channel.maxsize - 1
                    expect(channel.content[index].id).toEqual(9)
                })
            })
        })
        describe("getChannelMessages",function(){
            beforeEach(function(){
                // Let's saturate the channel with some messages
                for(var i = 0; i < 10 ; i++){
                    channel.pushMessage("THIS IS MESSAGE!",i)
                }
            })
            describe("without since parameter",function(){
                it("should output all messages in the queue",function(){
                    expected_result = channel.content
                    expect(channel.getChannelMessages(null)).toEqual(expected_result)
                })
            })
            describe("with a since parameter",function(){
                it("should output all message since the parameter",function(){
                    expected_result = [ {
                        message : 'THIS IS MESSAGE!',
                        channel_name : 'valid_channel',
                        id : 8
                    }, {
                        message : 'THIS IS MESSAGE!',
                        channel_name : 'valid_channel',
                        id : 9
                    } ];
                    expect(channel.getChannelMessages({since:7})).toEqual(expected_result)
                })
            })
        })
    })
});


describe("Store class",function(){
    beforeEach(function(){
        store = new (require("memoryMessageStore.js").Store)();
    });
    describe("initialisation",function(){
        it("should be properly initialized",function(){
            expect(store.maxsize).toEqual(10);
            expect(store.content).toEqual({});
            expect(store.count).toBe(0);
        })
    });

    describe("addBus",function(){
        beforeEach(function(){
            store.addBus("valid_bus");
        });
        it("should create a new bus",function(){
            expect(store.content["valid_bus"]).toEqual({});
        });
        it("should create a valid bus",function(){
            expect(store.isValidBus("valid_bus")).toBeTruthy();
        });
        describe("on existing bus",function(){
            it("should throw an exception",function(){
                expect(function(){ store.addBus("valid_bus") }).toThrow({name : "Adding existing bus exception", message : "Attempt to create a new bus, but it exists already (valid_bus)"})
            })
        })
    });

    describe("addChannel",function(){
        describe("on a valid bus",function(){
            beforeEach(function(){
                store.addBus("valid_bus");
                store.addChannel("valid_bus","valid_channel")
            });
            it("should create channel on top of a valid bus",function(){
                expect(store.content["valid_bus"]["valid_channel"]).toBeTruthy();
            });
            it("should create a valid channel",function(){
                expect(store.isValidChannel("valid_bus","valid_channel")).toBeTruthy();
            });
        });
        describe("on invalid bus",function(){
            it("should throw an exception",function(){
                expect(function(){ store.addChannel("invalid_bus","valid_channel") }).toThrow({name : "Bus not valid exception", message : "Attempt to create a new channel on a non-existing bus (invalid_bus)"})
            })
        });
        describe("on already existing channel",function(){
            beforeEach(function(){
                store.addBus("valid_bus");
                store.addChannel("valid_bus","valid_channel");
            });
            it("should throw an exception",function(){
                expect(function(){ store.addChannel("valid_bus","valid_channel") }).toThrow({name : "Adding existing channel exception", message : "Attempt to create a new bus, but it exists already (valid_channel)"})
            })
        })
    });
    describe("pushMessage",function(){
        beforeEach(function(){
            channel = require("memoryMessageStore.js").Channel;
            spyOn(channel.prototype,"pushMessage");
            store.addBus("valid_bus");
            store.addChannel("valid_bus","valid_channel");
            store.pushMessage("valid_bus","valid_channel","This is message")
        });
        it("should have called Channel.pushMessage",function(){
            expect(channel.prototype.pushMessage).toHaveBeenCalledWith("This is message",0)
        });
        it("should have increase the counter",function(){
            expect(store.count).toEqual(1);
        })
    });

    describe("getChannelMessages",function(){
        beforeEach(function(){
            channel = require("memoryMessageStore.js").Channel;
            spyOn(channel.prototype,"getChannelMessages");
            store.addBus("valid_bus");
            store.addChannel("valid_bus","valid_channel");
            store.pushMessage("valid_bus","valid_channel","This is message")
            store.getChannelMessages("valid_bus","valid_channel",null)
        });
        it("should call Channel.getChannelMessage",function(){
            expect(channel.prototype.getChannelMessages).toHaveBeenCalledWith(null);
        })
    });
    describe("getBusMessages",function(){
        describe("without since parameter",function(){
            beforeEach(function(){
                channel = require("memoryMessageStore.js").Channel;
                spyOn(channel.prototype,"getChannelMessages");
                store.addBus("valid_bus");
                store.addChannel("valid_bus","valid_channel");
                store.addChannel("valid_bus","valid_channel_#2");
                store.pushMessage("valid_bus","valid_channel","This is message");
                store.pushMessage("valid_bus","valid_channel_#2","This is message_#2");
                res = store.getBusMessages("valid_bus",null)
            });
            it("should return some result",function(){
                expected_result = [ {
                    message : 'This is message',
                    channel_name : 'valid_channel',
                    id : 0
                }, {
                    message : 'This is message_#2',
                    channel_name : 'valid_channel_#2',
                    id : 1
                } ];
                expect(res).toEqual(expected_result)
            })
        });

        describe("with since parameter",function(){
            beforeEach(function(){
                channel = require("memoryMessageStore.js").Channel;
                spyOn(channel.prototype,"getChannelMessages");
                store.addBus("valid_bus");
                store.addChannel("valid_bus","valid_channel");
                store.addChannel("valid_bus","valid_channel_#2");
                store.pushMessage("valid_bus","valid_channel","This is message");
                store.pushMessage("valid_bus","valid_channel_#2","This is message_#2");
                store.pushMessage("valid_bus","valid_channel","This is message #3");
                res = store.getBusMessages("valid_bus",{since:0}); // Message 0 already seen
            });
            it("should return some result",function(){
                expected_result = [ {
                    message : 'This is message #3',
                    channel_name : 'valid_channel', id : 2
                }, {
                    message : 'This is message_#2',
                    channel_name : 'valid_channel_#2',
                    id : 1
                } ];
                expect(res).toEqual(expected_result)
            })
        })
    });
    describe("channelMaxSize",function(){
        describe("on valid bus/channel",function(){
            beforeEach(function(){
                spyOn(store,"isValidChannel").andReturn(true);
                channel = require("memoryMessageStore.js").Channel;
                spyOn(channel.prototype,"updateMaxSize");
                store.addBus("valid_bus");
                store.addChannel("valid_bus","valid_channel");
                store.channelMaxSize("valid_bus","valid_channel",5);
            });
            it("should call isValidChannel",function(){
                expect(store.isValidChannel).toHaveBeenCalledWith("valid_bus","valid_channel");
            });
            it("should call channel.updateMaxSize",function(){
                expect(channel.prototype.updateMaxSize).toHaveBeenCalledWith(5);
            })
        });
        describe("on invalid bus/channel",function(){
            beforeEach(function(){
                spyOn(store,"isValidChannel").andReturn(false);
            });
            it("should throw an exception",function(){
                expect(function(){ store.channelMaxSize("valid_bus","valid_channel",5); }).toThrow({name:"Invalid channel exception", message: "Attempt to modify an invalid channel"})
            })
        })

    });
    describe("isValidChannel",function(){
        beforeEach(function(){
            store.addBus("valid_bus");
            store.addChannel("valid_bus","valid_channel")
        });
        it("should recognize a valid channel",function(){
            expect(store.isValidChannel("valid_bus","valid_channel")).toBeTruthy();
        });
        it("should recognize an invalid channel",function(){
            expect(store.isValidChannel("valid_bus","invalid_channel")).toBe(false);
        })
    });
    describe("isValidBus",function(){
        beforeEach(function(){
            store.addBus("valid_bus");
        });
        it("should recognize a valid bus",function(){
            expect(store.isValidBus("valid_bus")).toBeTruthy();
        });
        it("should recognize an invalid bus",function(){
            expect(store.isValidBus("invalid_bus")).toBe(false);
        })
    });
    describe("delChannel",function(){
       beforeEach(function(){
           store.addBus("valid_bus");
           store.addChannel("valid_bus","valid_channel_#1");
           store.addChannel("valid_bus","valid_channel_#2");
           store.addChannel("valid_bus","valid_channel_#3");
           store.delChannel("valid_bus","valid_channel_#2")
       });

        it("should have remove channel #2",function(){
            expect(store.isValidChannel("valid_bus","valid_channel_#2")).toBe(false);
        });
        it("should have kept the other",function(){
            expect(store.isValidChannel("valid_bus","valid_channel_#1")).toBe(true);
            expect(store.isValidChannel("valid_bus","valid_channel_#3")).toBe(true);
        })

    });
    describe("delBus",function(){
        beforeEach(function(){
            store.addBus("valid_bus")
            store.addChannel("valid_bus","valid_channel")
            store.delBus("valid_bus")
        });
        it("should have deleted the bus",function(){
            expect(store.isValidBus("valid_bus")).toBe(false)
        });
        it("should have deleted the channel",function(){
            expect(store.isValidChannel("valid_bus","valid_channel")).toBe(false)
        })
    });
    describe("lsBus",function(){
        beforeEach(function(){
            store.addBus("valid_bus")
            store.addBus("valid_bus2")
        });
        it("should output the two buses names",function(){
            expect(store.lsBus()).toEqual(["valid_bus","valid_bus2"])
        });
        it("should output one if I remove one",function(){
            store.delBus("valid_bus")
            expect(store.lsBus()).toEqual(["valid_bus2"])
        })
    });
    describe("lsChannel",function(){
        beforeEach(function(){
            store.addBus("valid_bus")
            store.addChannel("valid_bus","valid_channel1")
            store.addChannel("valid_bus","valid_channel2")
            store.addChannel("valid_bus","valid_channel3")
            store.addChannel("valid_bus","valid_channel4")
        });
        it("should output the four channels names",function(){
            expect(store.lsChannel("valid_bus")).toEqual(["valid_channel1","valid_channel2","valid_channel3","valid_channel4"])
        });
        it("should list two if I remove two",function(){
            store.delChannel("valid_bus","valid_channel2")
            store.delChannel("valid_bus","valid_channel4")
            expect(store.lsChannel('valid_bus')).toEqual(["valid_channel1","valid_channel3"])
        })
    })
});

describe("MemoryMessageStore class",function(){
    /**
     * This is mostly an interface for the Store class. We check that
     * everything is correctly plugged
     */
    beforeEach(function(){
        MMS = new (require("memoryMessageStore.js").MemoryMessageStore)();
    });
    describe("addBus",function(){
        beforeEach(function(){
            spyOn(MMS.store,"addBus")
            MMS.addBus("valid_bus");
        });
        it("should have called Store.addBus",function(){
            expect(MMS.store.addBus).toHaveBeenCalledWith("valid_bus")
        })
    });
    describe("addChannel",function(){
        beforeEach(function(){
            spyOn(MMS.store,"addChannel")
            MMS.addChannel("valid_bus","valid_channel")
        });
        it("should have called Store.addChannel",function(){
            expect(MMS.store.addChannel).toHaveBeenCalledWith("valid_bus","valid_channel")
        })
    });
    describe("save",function(){
        describe("valid bus/channel",function(){
            beforeEach(function(){
                spyOn(MMS,"validate").andReturn(true)
                spyOn(MMS.store,"isValidBus").andReturn(true)
                spyOn(MMS.store,"isValidChannel").andReturn(true);
                spyOn(MMS.store,"pushMessage").andReturn(true);
                MMS.addBus("valid_bus");
                MMS.addChannel("valid_bus","valid_channel");
                MMS.save("valid_bus","valid_channel","I am message")
            });
            it("should validate the message",function(){
                expect(MMS.validate).toHaveBeenCalled();
            });
            it("should check the bus availability",function(){
                expect(MMS.store.isValidBus).toHaveBeenCalledWith("valid_bus")
            });
            it("should check the channel availability",function(){
                expect(MMS.store.isValidChannel).toHaveBeenCalledWith("valid_bus","valid_channel")
            });
            it("should push the message",function(){
                expect(MMS.store.pushMessage).toHaveBeenCalledWith("valid_bus","valid_channel","I am message")
            })
        })
    });
    describe("getBusMessage",function(){
        describe("on valid bus",function(){
            beforeEach(function(){
                MMS.addBus("valid_bus");
                MMS.addChannel("valid_bus","valid_channel");
                spyOn(MMS.store,"isValidBus").andReturn(true);
                spyOn(MMS.store,"getBusMessages").andReturn("MESSAGES");
                callback = {callback: function(){} };
                spyOn(callback,"callback");
                MMS.getBusMessages("valid_bus",null,callback.callback)
            });
            it("should check the bus",function(){
                expect(MMS.store.isValidBus).toHaveBeenCalled()
            });
            it("should call Store.getBusMessages",function(){
                expect(MMS.store.getBusMessages).toHaveBeenCalledWith("valid_bus",null);
            });
            it("should call the callback",function(){
                expect(callback.callback).toHaveBeenCalledWith("MESSAGES",null)
            })
        });
        describe("on invalid bus",function(){
            beforeEach(function(){
                spyOn(MMS.store,"isValidBus").andReturn(false);
                callback = {callback: function(){} };
                spyOn(callback,"callback");
                MMS.getBusMessages("invalid_bus",null,callback.callback)
            });
            it("should check the bus",function(){
                expect(MMS.store.isValidBus).toHaveBeenCalled()
            });
            it("should call the callback",function(){
                expect(callback.callback).toHaveBeenCalledWith(null,{ name: "Invalid bus exception", message: "Attempt to read an invalid bus"});
            })
        })
    });
    describe("getChannelMessage",function(){
        describe("on valid channel",function(){
            beforeEach(function(){
                MMS.addBus("valid_bus");
                MMS.addChannel("valid_bus","valid_channel");
                spyOn(MMS.store,"isValidChannel").andReturn(true);
                spyOn(MMS.store,"getChannelMessages").andReturn("MESSAGES");
                callback = {callback: function(){} };
                spyOn(callback,"callback");
                MMS.getChannelMessages("valid_bus","valid_channel",null,callback.callback)
            });
            it("should check the channel",function(){
                expect(MMS.store.isValidChannel).toHaveBeenCalled()
            });
            it("should call Store.getChannelMessages",function(){
                expect(MMS.store.getChannelMessages).toHaveBeenCalledWith("valid_bus","valid_channel",null);
            });
            it("should call the callback",function(){
                expect(callback.callback).toHaveBeenCalledWith("MESSAGES",null)
            })
        });
        describe("on invalid channel",function(){
            beforeEach(function(){
                spyOn(MMS.store,"isValidChannel").andReturn(false);
                callback = {callback: function(){} };
                spyOn(callback,"callback");
                MMS.getChannelMessages("invalid_bus","valid_channel",null,callback.callback)
            });
            it("should check the channel",function(){
                expect(MMS.store.isValidChannel).toHaveBeenCalled()
            });
            it("should call the callback",function(){
                expect(callback.callback).toHaveBeenCalledWith(null,{ name: "Invalid bus/channel exception", message: "Attempt to read an invalid bus/channel"});
            })
        })
    });

    describe("newChannelSize",function(){
        beforeEach(function(){
            spyOn(MMS.store,"channelMaxSize")
            MMS.newChannelSize("valid_bus","valid_chanenl",5)
        });
        it("should have call store.channelMaxSize",function(){
            expect(MMS.store.channelMaxSize).toHaveBeenCalledWith("valid_bus","valid_chanenl",5)
        })
    });

    describe("validate",function(){
        var message;
        describe("with valid message",function(){
            beforeEach(function(){
                message = {source:"http://yo.com",payload:"THIS IS MADNESS!",type:"you're the type!"}
            });
            it("should return true",function(){
                expect(MMS.validate(message)).toBeTruthy();
            })
        });
        describe("with invalid source",function(){
            beforeEach(function(){
                message = {source:"htt//yo.com",payload:"THIS IS MADNESS!",type:"you're the type!"}
            });
            it("should poop all over the place",function(){
                expect(function(){ MMS.validate(message) }).toThrow({name: "Invalid Message Exception",message:"source must be a valid URL"});
            })
        });
        describe("with invalid message",function(){
            beforeEach(function(){
                message = {I:"am",totally:"invalid"};
            });
            it("should poop all over the place",function(){
                expect(function(){ MMS.validate(message) }).toThrow({name: "Invalid Message Exception",message:"Specify source, payload and type"});
            })
        })
    });

    describe("delBus",function(){
        beforeEach(function(){
            spyOn(MMS.store,"delBus")
            MMS.delBus("bus")
        });
        it("should have call store.delBus",function(){
            expect(MMS.store.delBus).toHaveBeenCalledWith("bus")
        })

    });
    describe("delChannel",function(){
        beforeEach(function(){
            spyOn(MMS.store,"delChannel")
            MMS.delChannel("bus","channel")
        });
        it("should have call Store.delChannel",function(){
            expect(MMS.store.delChannel).toHaveBeenCalledWith("bus","channel")
        })
    })
});
