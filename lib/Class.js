var Class = function(){};

var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

// Create a new Class that inherits from this class
Class.extend = function(props) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var proto = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in props) {
        if(typeof props[name] === "function"){
            // Check if we're overwriting an existing function
            proto[name] = typeof props[name] == "function" &&
                    typeof _super[name] == "function" && fnTest.test(props[name]) ?
                    (function(name, fn){
                        return function() {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret;
                        };
                    })(name, props[name]) :
                    props[name];
        }
    }

    // The dummy class constructor
    function Class() {
        // All construction is actually done in the init method via the spawn function
        // Trying to instantiate this Class with the new keyword will throw an error
        if(!initializing) throw "Don't use the new keyword to create this object. Instead use the 'spawn' function.";
    }

    // Populate our constructed prototype object
    Class.prototype = proto;

    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    Class.spawn = function(propValues, skipInit){
        // Martial values onto property definitions
        var finalProps = {};
        for(var key in props){
            if(typeof props[key] !== "function"){
                finalProps[key] = props[key];
                finalProps[key].value = propValues[key];
            }
        }

        // Create, initialize and return the new object
        var newObject = Object.create(Class.prototype,finalProps);
        if(newObject.init && !skipInit)newObject.init();
        return newObject;
    };

    // And make this class extensible
    Class.extend = (function(fn){
        return function(childProps){
            //If the parent has properties not defined by the child, copy them on
            for(var key in props){
                if(!childProps[key]) childProps[key] = props[key];
            }
            return fn.call(this,childProps);
        }
    })(arguments.callee);

    return Class;
};

if (typeof exports !== "undefined") { // CommonJS module support
    exports.Class = Class;
}