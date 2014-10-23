var expect = require('chai').expect;
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

var _ = require("underscore");
var util = require("../src/modules/util.js");

describe('util', function(){
    describe("hashArray", function(){
       it('should make hash from array', function(){
           var a = {k: 'a', v: 1};
           var b = {k: 'b', v: 2};
           
           var hashed = util.hashArray("k", [a, b]);
           expect(hashed).to.eql({'a': a, 'b': b});
       });
    });
    
    describe("getFY", function() {
        it("should return previous calendar year in march", function() {
            expect(util.getFY(new Date("2011-03-31"))).to.eql("2010-11");
        });
        it("should return same calendar year in april", function() {
            expect(util.getFY(new Date("2011-04-01"))).to.eql("2011-12");
        });
    });
    
    describe("checkArgs", function(){
        function fn(str, num) {
            util.checkArgs(arguments, String, Number);
        }
        
       it('should reject invalid args', function(){
           expect(function() {
               fn(1, "2");
           }).to.throw(TypeError);
       });
        
       it('should accept valid args', function(){
           expect(function() {
               fn("1", 2);
           }).to.not.throw(TypeError);
       });
    });
    
    describe("uid", function(){
       it('should return distinct uids', function(){
           expect(util.uid()).to.not.eql(util.uid());
       });
    });
    
    describe("getter", function(){
       it('should get', function(){
           var t = function(){};
           t.prototype.foo = function(){ return "bar"; };
           
           expect(util.getter("foo")(new t())).to.eql("bar");
       });
    });
    
    describe("merge", function(){
       it('should merge objects', function(){
           expect(util.merge([{a: 1}, {b: 2}])).to.eql({a: 1, b: 2});
       });
       
       it('should merge using function if supplied', function(){
           var merged = util.merge([{a: 1}, {a: 3, b: 2}], function(a, b) {
               return a + b;
           });
           
           expect(merged).to.eql({a: 4, b: 2});
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
