var expect          = require('chai').expect;
var describe        = global.describe, it = global.it;

var _               = require("underscore");

var palette         = require("../src/modules/palette.js");

describe("palette", function() {
    it("should generate array of objects mapping keys to unique colors", function(){
        var keys = ["a", "b", "c"];
        var p = palette.generate(8, keys);
        
        var allColors = _.flatten(
            _.map(p, function(x){ return _.values(x) })
        );
        
        expect(p.length).to.eql(8);
        expect(_.uniq(allColors)).to.eql(allColors);
        
        _.each(p, function(p) {
            expect(_.size(p)).to.eql(3);
        
            _.each(p, function(item, key) {
                expect(_.contains(keys, key)).to.beTrue;
            });
        });
    });
});
