var expect = require('chai').expect;
var _ = require("underscore");

var Table = require("../src/js/table.js");
var util = require("../src/js/util.js");
var describe = global.describe, it = global.it, beforeEach = global.beforeEach;

describe('Table', function(){
    var table, observer, rowsByName;
    
    beforeEach(function() {
        var data = [
            {name: "Batman", power: 30, human: true},
            {name: "Superman", power: 21, human: true},
            {name: "Megazord", power: 19, human: false}
        ];
        
        rowsByName = util.hashArray('name', data);
        table = new Table(data); 
        
        observer = function(x){ observer.value = x; };
    });
    
    function batmanFilter() {
        return new Table.Filter("name", [{predicate: "Batman"}]);
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
        
        it("should vend table indexes", function() {
            var batmanView = new Table.View([batmanFilter()]);
            expect(batmanView.tableIndexes()).to.eql(["name"]);
        });
    });
    
    describe("Filter", function(){
        it("should return current option", function() {
            expect(batmanFilter().current().predicate).to.eql("Batman");
        });
    });
});
