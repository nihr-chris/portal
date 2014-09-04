var Ractive = window.Ractive;
var template = require('template');

console.log(template("sidebar"));

var r = new Ractive({
    el: 'sidebar',
    template: template("sidebar"),
    data: {
        navbarOptions: [
            {title: "Overview", active: false},
            {title: "Recruitment", active: true},
            {title: "Time & Target", active: false},
            {title: "Engagement", active: false}
        ]
    }
});
