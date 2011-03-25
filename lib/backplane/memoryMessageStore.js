
utils = require("./../utils.js");

function Channel(channel_name)  {
    /**
     * @class Channel
     * @private
     * Implements a channel, take care of the queue of messages
     */
    this.maxsize = 10;
    this.channel_name = channel_name;
    this.content = new Array();
    this.len = function(){
        return this.content.length;
    };

    this.pushMessage = function(content,count){
        // Remove trailing, old elements (store only the latest messages)
        // count is maintained by the Store object, and allows to identify message with a unique, increasing id.
        while (this.len() >= this.maxsize){
            this.content.shift();
        }
        this.content.push({
            message:content // The backplane message
            , channel_name:this.channel_name 
            , id:count}); // Unique ID for the bus, for reference.
    };


    // update the maxsize for this channel and remove potential extra-messages
    this.new_maxsize =  function(size){
        this.maxsize = size;
        while (this.len() > this.maxsize){
            this.content.shift();
        }
    };


    this.getChannelMessages = function(options){
        if(options&&options.since){
            // Return the content of the whole channel until the "since" message
            var res = new Array(); // output
            for (index in this.content){
                var message = this.content[index]
                if (message.id > options.since) {
                    res.push(message)
                }
            }
            return res
        } else {
            // Return the entire channel
            return this.content
        }
    }
}


function Store()  {
    /**
     * @class Store
     * @private
     * Implements the Store. Deals with Bus and Channel construction/checking
     * Retrieve information from Bus/Store
     */
    this.maxsize = 10; // default number of messages stored for all NEW channel
    this.content = {};
    this.count = 0;

    // Add a new bus to the store
    this.addBus = function(bus) {
        if (this.content[bus]) {
            throw {name : "Adding existing bus exception", message : "Attempt to create a new bus, but it exists already (" + bus + ")"}
        } else {
            this.content[bus] = {};
        }
    };

    // Add a new channel to an existing bus
    this.addChannel = function(bus,channel){
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

    this.getChannelMessages = function(bus,channel,options){
        return this.content[bus][channel].getChannelMessages(options)
    }

    this.getBusMessages = function(bus,options){
        if (options && options.since){
            var res = new Array();
            for (var channel in this.content[bus]){
                for (var index in this.content[bus][channel].content){
                    var message = this.content[bus][channel].content[index];
                    if (message.id > options.since) {
                        res.push(message)
                    }
                }
                return res
            }
        } else {
            var res = new Array();
            for (var channel in this.content[bus]){
                for (var index in this.content[bus][channel].content){
                    var message = this.content[bus][channel].content[index];
                    res.push(message);
                }
            }
            return res;
        }
        
    }

    // Append a message to a given channel. Requires valid/existing bus/channel
    this.pushMessage = function(bus,channel,content){
        this.content[bus][channel].pushMessage(content,this.count);
        this.count += 1;
    };

    this.isValidChannel = function(bus,channel){
        return !!(this.content[bus]) && !!(this.content[bus][channel])
    };
    this.isValidBus = function(bus){
        return !!(this.content[bus]);
    };

    this.delChannel = function(bus,channel){
        if (!this.isValidChannel(bus,channel)){
            throw {name:"Invalid channel exception", message: "Attempt to delete a invalid channel"}
        } else {
            delete this.content[bus][channel]
        }
    };
    
    this.delBus = function(bus){
        if (!this.isValidBus(bus)){
            throw {name:"Invalid bus exception", message: "Attempt to delete a invalid bus"}
        } else {
            delete this.content[bus]
        }
    };

    this.lsBus = function(){
        // List all the bus stored
        res = new Array();
        for (i in this.content){
            res.push(i);
        }
        return res
    };
    this.lsChannel = function(bus){
        // list all channel for a bus
        if (this.isValid(bus)){
            res = new Array();
            for (i in this.content[bus]){
                res.push(i)
            }
            return res
        } else {
            throw {name: "Invalid bus exception", message: "Attempt to access an invalid bus"}
        }
    }
}


module.exports = (function(){
    /**
     * The memoryMessageStore class deals with:
     * - storing the message in memory
     * - validating messages
     * - bus and channel management (creation, access)
     * - providing messages (for bus and/or channel)
     * - cleaning outdated messages
     * @class memoryMessageStore
     * @require utils.js
     */

   var my = {};

   my.store = new Store;

   my.save = function(bus,channel,content){
       /**
        * @method save
        * @param {string} bus bus where the channel you want to post to lies. Must be a valid bus
        * @param {string} channel channel where to post the message
        * @param {backplane message} message backplane message to post. Must be a valid backplane message
        * @return null
        */
       if (!my.validate(content)){
         throw {name: "Content not valid exception",message:"Attempt to push an invalid message to the channel "+bus+"/"+channel}
       } else {
           if (!my.store.isValidBus(bus)){
               throw {name: "Invalid bus exception", message: "Can't push to non-existing bus"}
           } else if (my.store.isValidChannel(bus,channel)){
                my.store.pushMessage(bus,channel,content)
               } else {
                   my.store.addChannel(bus,channel);
                   my.store.pushMessage(bus,channel,content)
               }
       }
   };

   my.addBus = function(bus){
       /**
        * @method addBus
        * @param {string} bus the bus to be created
        */
       my.store.addBus(bus);
   }

   my.addChannel = function(bus,channel){
       /**
        * @method addChannel
        * @param {string} bus bus on top of which to create the channel
        * @param {string} channel channel to create
        */
       my.store.addChannel(bus,channel)
   }

   my.getChannelMessages = function(bus,channel,options,callback){
       /**
        * Retrieve messages from a given channel
        * @method getChannelMessages
        * @param {string} bus bus where the channel lies
        * @param {channel} channel channel to retrieve the messages from
        * @param {Object} options allows to pass a "since" parameter, indicating the id of the last message retrieved before. Method will return new messages published since "since" (unless "since" is too old, in which case it will retrieve all messages in the queue).
        * @param {function} callback callback method. Will be called as callback(message,error)
        */
       if(!my.store.isValidChannel(bus,channel)){
           callback(null,{ name: "Invalid bus/channel exception", message: "Attempt to read an invalid bus/channel"});
       } else {
           var messages = my.store.getChannelMessages(bus,channel,options);
           callback(messages,null)
       }
   };

   my.getBusMessages = function(bus,options,callback){
       /**
        * Retrieve messages from all the channel of a given bus
        * @method getBusMessages
        * @param {string} bus bus from which to retrive messages
        * @param {Object} options allows to pass a "since" parameter, indicating the id of the last message retrieved before. Method will return new messages published since "since" (unless "since" is too old, in which case it will retrieve all messages in the queue).
        * @param {function}: callback callback method. Will be called as callback(message,error)
        */
       if(!my.store.isValidBus(bus)){
           callback(null,{ name: "Invalid bus exception", message: "Attempt to read an invalid bus"});
       } else {
           var messages = my.store.getBusMessages(bus,options);
           callback(messages,null);
       }
   };

   my.validate = function(message){
       /**
        * @method validate
        * @param {backplane message} message Message to be validated
        * check that message is a proper Backplane message with source, type and payload
        */
       if(!message.source || !message.payload || !message.type){
           throw {name: "Invalid Message Exception",message:"Specify source, payload and type"}
       } else {
          if  (utils.isValidURL(message.source)) {
              return true
          } else { throw {name: "Invalid Message Exception",message:"source must be a valid URL"} }
       }
   };

   my.delChannel = function(bus,channel){
    /**
     * @method delChannel
     * @param {string} bus bus where the channel to be deleted lies
     * @param {string} channel channel to be removed. Must exist
     * delete the channel.
     */
     my.store.delChannel(bus,channel)
   };

   my.delBus = function(bus){
   /**
    * @method delBus
    * @param {string}: bus bus to be deleted
    * delete the bus
    * the bus MUST exist
    */
       my.store.delBus(bus)
    };
    
   return my;
})();