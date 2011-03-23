var Trait = require('traits').Trait;

/**
 * A utility module used by this library
 * @module utils
 */

/**
 * A Trait class for holding helper functions for enforcing scope
 * @class TBind
 */

exports.TBind = function(){
    return Trait({
        /**
         * A bind function which binds the scope of the funciton to be called to the local scope of the object.
         * @function bind
         * @param {function} fn The function to bind the local scope to
         * @return The function passed in bound to the local scope
         */
        bind: function(fn){
            var scope = this;
            return function () {
                fn.apply(scope, arguments);
            };
        }
    });
};