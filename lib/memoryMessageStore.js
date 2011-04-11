utils = require("./utils.js");

var Channel = function(channel_name)  {
    /**
     * @class Channel
     * @private
     * @constructor
     * Implements a channel, take care of the queue of messages
     */
    this.channel_name = channel_name; // A channel need to know how it is named, for tagging its messages
    this.content = new Array(); // Internal queue to store the messages
    this.maxsize = 10; // Indicates the length of the queue (default). Can be changed with updateMaxSize(int)
}

Channel.prototype.len = function(){
        return this.content.length;
    };

Channel.prototype.pushMessage = function(message,count){
        // Remove trailing, old elements (store only the latest messages)
        // count is maintained by the Store object, and allows to identify message with a unique, increasing id.
        while (this.len() >= this.maxsize){
            this.content.shift();
        }
        this.content.push({
            message:message // The backplane message
            , channel_name:this.channel_name 
            , id:count}); // Unique ID for the bus, for reference.
    };


    // update the maxsize for this channel and remove potential extra-messages
Channel.prototype.updateMaxSize =  function(size){
        this.maxsize = size;
        while (this.len() > this.maxsize){
            this.content.shift();
        }
    };


Channel.prototype.getChannelMessages = function(options){
    var res = new Array();
    if(options&&(options.since || options.since == 0)){
        // Return the content of the whole channel until the "since" message
        for (index in this.content){
            var message = this.content[index]
            if (message.id > options.since) {
                res.push(message)
            }
        }
    } else {
        // Return the entire channel
        res = this.content
    }
    return res;
}


var Store = function()  {
    /**
     * @class Store
     * @private
     * @constructor
     * Implements the Store. Deals with Bus and Channel construction/checking
     * Retrieve information from Bus/Store
     */
    this.maxsize = 10; // default number of messages stored for all NEW channel
    this.content = {};
    this.count = 0;
}


// Add a new bus to the store
Store.prototype.addBus = function(bus) {
    if (this.content[bus]) {
        throw {name : "Adding existing bus exception", message : "Attempt to create a new bus, but it exists already (" + bus + ")"}
    } else {
        this.content[bus] = {};
    }
};

// Add a new channel to an existing bus
Store.prototype.addChannel = function(bus,channel){
    if (!this.content[bus]){
        throw {name : "Bus not valid exception", message : "Attempt to create a new channel on a non-existing bus ("+bus+")"}
    } else {
        if (!this.content[bus][channel]){
            this.content[bus][channel] = new Channel(channel);
        }
        else {
            throw {name : "Adding existing channel exception", message : "Attempt to create a new bus, but it exists already ("+channel+")"}
        }
    }
};

// Append a message to a given channel. Requires valid/existing bus/channel
Store.prototype.pushMessage = function(bus,channel,content){
    this.content[bus][channel].pushMessage(content,this.count);
    this.count += 1;
};

Store.prototype.getChannelMessages = function(bus,channel,options){
    return this.content[bus][channel].getChannelMessages(options)
};


Store.prototype.getBusMessages = function(bus,options){
    var res = new Array();
    if (options && (options.since || options.since == 0)){
        for (var channel in this.content[bus]){
            for (var index in this.content[bus][channel].content){
                var message = this.content[bus][channel].content[index];
                if (message.id > options.since) {
                    res.push(message)
                }
            }
        }
    } else {
        for (var channel in this.content[bus]){
            for (var index in this.content[bus][channel].content){
                var message = this.content[bus][channel].content[index];
                res.push(message);
            }
        }
    }
    return res;
};

Store.prototype.channelMaxSize = function(bus,channel,size){
    if(!this.isValidChannel(bus,channel)){
        throw {name:"Invalid channel exception", message: "Attempt to modify an invalid channel"}
    } else {
        this.content[bus][channel].updateMaxSize(size)
    }
};

Store.prototype.isValidChannel = function(bus,channel){
    return !!(this.content[bus]) && !!(this.content[bus][channel])
};
Store.prototype.isValidBus = function(bus){
    return !!(this.content[bus]);
};

Store.prototype.delChannel = function(bus,channel){
    if (!this.isValidChannel(bus,channel)){
        throw {name:"Invalid channel exception", message: "Attempt to delete an invalid channel"}
    } else {
        delete this.content[bus][channel]
    }
};

Store.prototype.delBus = function(bus){
    if (!this.isValidBus(bus)){
        throw {name:"Invalid bus exception", message: "Attempt to delete a invalid bus"}
    } else {
        delete this.content[bus]
    }
};

Store.prototype.lsBus = function(){
    // List all the bus stored
    res = new Array();
    for (i in this.content){
        res.push(i);
    }
    return res
};

Store.prototype.lsChannel = function(bus){
    // list all channel for a bus
    if (this.isValidBus(bus)){
        res = new Array();
        for (i in this.content[bus]){
            res.push(i)
        }
        return res
    } else {
        throw {name: "Invalid bus exception", message: "Attempt to access an invalid bus"}
    }
};





var MemoryMessageStore = function(){
    /**
     * The memoryMessageStore class deals with:
     * <ul>
     * <li> storing the message in memory</li>
     * <li> validating messages</li>
     * <li> bus and channel management (creation, access)</li>
     * <li> providing messages (for bus and/or channel)</li>
     * <li> cleaning outdated messages</li>
     * </ul>
     * @class memoryMessageStore
     * @require utils.js
     */
    this.store = new Store;
};

MemoryMessageStore.prototype.save = function(bus,channel,content){
           /**
            * @method save
            * @param {string} bus bus where the channel you want to post to lies. Must be a valid bus
            * @param {string} channel channel where to post the message
            * @param {backplane message} message backplane message to post. Must be a valid backplane message
            * @return null
            */
           if (!this.validate(content)){
             throw {name: "Content not valid exception",message:"Attempt to push an invalid message to the channel "+bus+"/"+channel}
           } else {
               content = JSON.parse(content);
               if (!this.store.isValidBus(bus)){
                   throw {name: "Invalid bus exception", message: "Can't push to non-existing bus"}
               } else if (this.store.isValidChannel(bus,channel)){
                    this.store.pushMessage(bus,channel,content)
                   } else {
                       this.store.addChannel(bus,channel);
                       this.store.pushMessage(bus,channel,content)
                   }
           }
       };

MemoryMessageStore.prototype.addBus = function(bus){
           /**
            * @method addBus
            * @param {string} bus the bus to be created
            */
           this.store.addBus(bus);
       };

MemoryMessageStore.prototype.addChannel = function(bus,channel){
           /**
            * @method addChannel
            * @param {string} bus bus on top of which to create the channel
            * @param {string} channel channel to create
            */
           this.store.addChannel(bus,channel)
       };


MemoryMessageStore.prototype.getBusMessages = function(bus,options,callback){
           /**
            * Retrieve messages from all the channel of a given bus
            * @method getBusMessages
            * @param {string} bus bus from which to retrieve messages
            * @param {Object} options allows to pass a "since" parameter, indicating the id of the last message retrieved before. Method will return new messages published since "since" (unless "since" is too old, in which case it will retrieve all messages in the queue).
            * @param {function} callback callback method. Will be called as callback(message,error)
            */
           if(!this.store.isValidBus(bus)){
               callback({ name: "Invalid bus exception", message: "Attempt to read an invalid bus"});
           } else {
               var messages = this.store.getBusMessages(bus,options);
               callback(messages);
           }
       };

MemoryMessageStore.prototype.getChannelMessages = function(bus,channel,options,callback){
           /**
            * Retrieve messages from a given channel
            * @method getChannelMessages
            * @param {string} bus bus where the channel lies
            * @param {string} channel channel to retrieve the messages from
            * @param {Object} options allows to pass a "since" parameter, indicating the id of the last message retrieved before. Method will return new messages published since "since" (unless "since" is too old, in which case it will retrieve all messages in the queue).
            * @param {function} callback callback method. Will be called as callback(message,error)
            */
           if(!this.store.isValidChannel(bus,channel)){
               callback([]);
//               callback({ name: "Invalid bus/channel exception", message: "Attempt to read an invalid bus/channel"},null);
           } else {
               var messages = this.store.getChannelMessages(bus,channel,options);
               callback(messages)
           }
       };


MemoryMessageStore.prototype.newChannelSize = function(bus,channel,size){
           /**
            * Change the number of message stored in a channel. If when called, the channel already store more message than <size>, older messages will be swept.
            * @method newChannelSize
            * @param {string} bus bus where the channel lies
            * @param {string} channel channel
            * @param {int} size number of message to store in the channel
            */
           this.store.channelMaxSize(bus,channel,size)
       };


MemoryMessageStore.prototype.validate = function(message){
   /**
    * @method validate
    * @param {backplane message} message Message to be validated
    * check that message is a proper Backplane message with source, type and payload
    */
  var json = JSON.parse(message);

   if(!json.source || !json.payload || !json.type){
       throw {name: "Invalid Message Exception",message:"Specify source, payload and type"}
   } else {
      if  (utils.isValidURL(json.source)) {
          return true
      } else { throw {name: "Invalid Message Exception",message:"source must be a valid URL"} }
   }
};

MemoryMessageStore.prototype.delChannel = function(bus,channel){
        /**
         * @method delChannel
         * @param {string} bus bus where the channel to be deleted lies
         * @param {string} channel channel to be removed. Must exist
         * delete the channel.
         */
         this.store.delChannel(bus,channel)
       };

MemoryMessageStore.prototype.delBus = function(bus){
       /**
        * @method delBus
        * @param {string} bus bus to be deleted
        * delete the bus
        * the bus MUST exist
        */
           this.store.delBus(bus)
        };



exports.Channel = Channel;
exports.Store = Store;
exports.MemoryMessageStore = MemoryMessageStore;

