var Ractive = window.Ractive;
var util = require("./util.js");
var template = require("template");

function filterModel(modelDefs) {
    return {
        filters: [],
        newRow: function() {
            var menusArray = modelDefs.map(function(x){ 
                return {
                    type: x.type, 
                    options: x.options, 
                    current: x.options[0]
                };
            });
            
            var rowModel = util.hashArray('type', menusArray);
            rowModel.dataColor = "#428bca";
            
            return rowModel;
        }
    };
}

module.exports = Ractive.extend({
    template: template('filter'),
    init: function () {
        var ractive = this;
        
        ractive.on('delete', function(event) {
            ractive.set('filterRows', ractive.data.filterRows
                .filter(function(x){
                return x !== event.context;
            }));
        });
        
        ractive.on('insert', function(event) {
            ractive.push('filterRows', ractive.data.model.newRow());
        });
    },
    data: {
        model: filterModel([
            {type: 'network', options: ["All Networks"]},
            {type: 'division', options: ["All Divisions"]},
            {type: 'specialty', options: ["All Specialties"]},
            {type: 'site', options: ["All Sites"]}
        ]),
        
        filterRows: []
    }
});
