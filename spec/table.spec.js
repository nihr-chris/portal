var expect = require('chai').expect;
var _ = require("underscore");

var Table = require("../src/js/table.js");
var util = require("../src/js/util.js");
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

describe('Table', function(){
    var table, observer, rowsByName;
    
    beforeEach(function() {
        var data = [
            {name: "Batman", power: 100, human: true},
            {name: "Superman", power: 30, human: true},
            {name: "Megazord", power: 30, human: false}
        ];
        
        rowsByName = util.hashArray('name', data);
        table = new Table(data); 
        
        observer = function(x){ observer.value = x; };
    });
    
    function filter(key, predicate) {
        return new Table.Filter(key, [{predicate: predicate}]);
    }
    
    function batmanOrSupermanFilter() {
        return new Table.Filter("name", [
            {predicate: "Batman"},
            {predicate: "Superman"}
        ]);
    }
    
    function batmanFilter() {
        return filter("name", "Batman");
    }
    
    describe("adding a view to a table", function(){
        it("should notify observers", function() {
            table.addObserver("views", null, observer);
            
            var view = new Table.View([batmanFilter()]);
            table.addView(view);
            
            expect(observer.value).to.eql([view]);
        });
    });
    
    describe("adding a view to a table", function(){
        it("should notify observers", function() {
            var view = new Table.View([batmanFilter()]);
            table.addView(view);
            
            table.addObserver("views", null, observer);
            table.removeView(view);
            
            expect(observer.value).to.eql([]);
        });
    });
    
    describe("View", function(){
        it("should apply filter to produce value", function() {
            var batmanView = new Table.View([batmanFilter()]);
            table.addView(batmanView);
            
            expect(batmanView.value()).to.eql([rowsByName['Batman']]);
        });
        
        it("should filter on multiple columns", function() {
            var view = new Table.View([
                filter("human", true),
                filter("power", 100)
            ]);
            
            table.addView(view);
            
            expect(view.value()).to.eql([rowsByName['Batman']]);
        });
        
        it("should return multiple rows", function() {
            var view = new Table.View([
                filter("human", true)
            ]);
            
            table.addView(view);
            
            expect(view.value().length).to.eql(2);
            expect(view.value()).to.have.members([
                rowsByName['Batman'],
                rowsByName['Superman']
            ]);
        });
        
        it("should vend table indexes", function() {
            var batmanView = new Table.View([batmanFilter()]);
            expect(batmanView.tableIndexes()).to.eql(["name"]);
        });
        
        it("value should bind to current filter selection", function() {
            var multiFilter = batmanOrSupermanFilter();
            
            var view = new Table.View([multiFilter]);
            
            view.addObserver("value", null, observer);
            table.addView(view);
            
            expect(view.value()).to.eql([rowsByName["Batman"]]);
            expect(observer.value).to.eql([rowsByName["Batman"]]);
            
            multiFilter.selectOptionIndex(1);
            
            expect(view.value()).to.eql([rowsByName["Superman"]]);
            expect(observer.value).to.eql([rowsByName["Superman"]]);
        });
    });
    
    describe("Filter", function(){
        it("should return current option", function() {
            expect(batmanFilter().current().predicate).to.eql("Batman");
        });
        
        it("should post option change notification", function() {
            var multiFilter = batmanOrSupermanFilter();
            multiFilter.addObserver("current", null, observer);
            
            multiFilter.selectOptionIndex(1);
            expect(observer.value.predicate).to.eql("Superman");
        });
    });
});
