var Ractive = window.Ractive;
var template = require('template');

var r = new Ractive({
    el: 'sidebar',
    template: template("sidebar")
});
