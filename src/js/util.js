var _ = require("underscore");

var hashArray = function(idKey, array) {
    var hash = {};
    array.forEach(function(x) {
        hash[x[idKey]] = x; 
    });
    return hash;
};


/**
 * makeObservable()
 * 
 * When passed a type, adds add/remove observer methods.
 * 
 * Adds an update() function that notifies all observers of a function that
 * the function's value has changed.
 */
 
var makeObservable = function(type) {
    var getObservers = function(instance, what) {
        if (typeof this._observers === "undefined")  this._observers = {};
        if (typeof this._observers[what] === "undefined")  this._observers[what] = [];
        
        return this._observers[what];
    };
    
    var notify = function(instance, what, fn) {
        var value = _.bind(instance[what], instance)();
        fn(value);
    };
    
    type.prototype.addObserver = function(what, observer, observerFn) {
        if (typeof observerFn === "string") {
            observerFn = _.bind(observer[observerFn], observer);
        }
        
        var observers = getObservers(this, what);
        observers.push([observer, observerFn]);
        
        notify(this, what, observerFn);
    };
    
    type.prototype.removeObserver = function(what, observer) {
        var observers = getObservers(this, what);
        this._observers[what] = _.reject(observers, function(entry) {
            return entry[0] === observer;
        });
    };
    
    type.prototype.notifyObservers = function(what) {
        var observers = getObservers(this, what);
        var instance = this;
        
        _.each(observers, function(x) {
            notify(instance, what, x);
        });
    };
};


/**
 * uid()
 * 
 * Returns a unique identifier each time uid is called
 */
 
var currentUID = 0;
var uid = function() {
    return currentUID++;
};


var merge = function(objects, mergeFn) {
    if (typeof mergeFn === "undefined") {
        mergeFn = _.identity;
    }
    
    var merged = {};
    _.each(objects, function(o) {
        _.each(o, function(val, key) {
            if (merged[key]) {
                merged[key] = mergeFn(merged[key], val);
            } else {
                merged[key] = val;
            }
        });
    });
};


module.exports = {
    hashArray: hashArray,
    uid: uid,
    merge: merge,
    makeObservable: makeObservable
};
