var Ractive = window.Ractive;
var template = require('template');

console.log("woop")

var r = new Ractive({
    el: 'sidebar',
    template: template("sidebar")
});
