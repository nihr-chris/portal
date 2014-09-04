var expect = require('chai').expect;
var util = require("../src/js/util.js");

describe('util', function(){
    describe("hashArray", function(){
       it('should make hash from array', function(){
           var a = {k: 'a', v: 1};
           var b = {k: 'b', v: 2};
           
           var hashed = util.hashArray("k", [a, b]);
           expect(hashed).to.eql({'a': a, 'b': b});
       });
    });
});
