var Ractive = window.Ractive;
var util = require("./util.js");
var template = require("template");

function filterModel(modelDefs) {
    return {
        filters: [],
        newRow: function() {
            var menusArray = modelDefs.map(function(x){ 
                var optionNames = x.options;
                
                var optionModels = optionNames.map(function(x) {
                    return {label: x};
                });
                
                return {
                    type: x.type, 
                    options: optionModels, 
                    current: optionModels[0]
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
            ractive.data.removeRow();
        });
        
        ractive.on('insert', function(event) {
            ractive.data.addRow();
        });
    },
    data: {
        filterRows: []
    }
});
