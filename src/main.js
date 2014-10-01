var Ractive = require("ractive");
var template = require("template");
var log = require('loglevel');

log.setLevel("trace");

require('./components/areachart.js');
require('./components/dropdown.js');
require('./components/filter.js');
require('./components/master-detail.js');

new Ractive.components.masterdetail({
    el: "#main",
    template: template("master-detail.html"),
    data: {
        detailElement: "#detail",
        options: [
            {
                title: "Overview", 
                id: "overview", 
                component: new Ractive({template: template('overview.html')})
            },
            {
                title: "Recruitment", 
                id: "recruitment", 
                component: new Ractive({template: template('recruitment.html')})
            }
        ]
    }
});
