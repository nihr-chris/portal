var expect          = require('chai').expect;
var describe        = global.describe, it = global.it;

var _               = require("underscore");

var palette         = require("../src/modules/palette.js");

describe("palette", function() {
    it("should generate array of objects mapping keys to unique colors", function(){
        var p = palette.generate(["a", "b", "c"]);
        var allColors = _.values(p);
        
        expect(_.size(p)).to.eql(3);
        expect(_.uniq(allColors)).to.eql(allColors);
    });
});
