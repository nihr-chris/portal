var expect = require('chai').expect;
var _ = require("underscore");

var util = require("../src/js/util.js");
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

describe('util', function(){
    describe("hashArray", function(){
       it('should make hash from array', function(){
           var a = {k: 'a', v: 1};
           var b = {k: 'b', v: 2};
           
           var hashed = util.hashArray("k", [a, b]);
           expect(hashed).to.eql({'a': a, 'b': b});
       });
    });
    
    describe('observers', function() {
        var Observable, Observer, source, observer;
        
        beforeEach(function() {
            Observable = function(){};
            Observable.prototype.value = function() {
                return this.observableValue;
            };
            
            Observer = function(){};
            Observer.prototype.observe = function(x) {
                this.observedValue = x;
            };
            
            util.makeObservable(Observable);
            
            source = new Observable();
            observer = new Observer();
        });
        
        it("should fire observers on change", function() {
            source.addObserver("value", observer, _.bind(observer.observe, observer));
            
            source.observableValue = "1";
            source.notifyObservers("value");
            
            expect(observer.observedValue).to.eql("1");
        });
        
        it("should allow method name to be passed as observerFn", function() {
            source.addObserver("value", observer, "observe");
            
            source.observableValue = "1";
            source.notifyObservers("value");
            
            expect(observer.observedValue).to.eql("1");
        });
        
        it("should not fire observers after removal", function() {
            source.addObserver("value", observer, _.bind(observer.observe, observer));
            source.removeObserver("value", observer);
            
            source.observableValue = "1";
            source.notifyObservers("value");
            
            expect(observer.observedValue).to.not.eql("1");
        });
        
        it("should not notify observers of other instance of type", function() {
            var notTheSource = new Observable();
            
            notTheSource.addObserver("value", observer, _.bind(observer.observe, observer));
            source.observableValue = "1";
            
            expect(observer.observedValue).to.not.eql("1");
        });
    });
});
