var Ractive = require("ractive")

/**
 * <data>
 * 
 * Invisible component that binds to a function returning a Promise and an argument
 * to the function.
 * 
 * When either changes, the component calls the function, waits for the promise
 * to complete, then updates its 'value' attribute with the result of the promise.
 */
 
Ractive.components.data = Ractive.extend({
    template: "",
    init: function() {
        this.observe("query params", this.makeQuery.bind(this));
    },
    
    makeQuery: function() {
        var query = this.get("query"), params = this.get("params");
        if (!query || !params) return;
        
        var promise = query(params);
        var updateValue = this.updateValue.bind(this);
        
        this.currentPromise = promise;
        
        promise.then(
            function(value){ updateValue(value, promise) }
        );
    },
    
    updateValue: function(value, promise) {
        // Guard against long-running query completing after a later query
        // and overwriting the later query's value
        if (promise !== this.currentPromise) return;
        
        this.set("value", value);
    }
});

if (window.developmentMode) {
    var Promise = require("promise");
    
    Ractive.components.datatest = Ractive.extend({
        template: (
            "<data query='{{makeQuery}}' params='{{queryParams}}' value='{{queryValue}}'>"
            + "</data>"
            + "{{ queryValue ? queryValue : 'waiting...' }}"
        ),
        
        data: {
            makeQuery: function(params){
                return new Promise(function(resolve) {
                    window.setTimeout(function(){
                        resolve(params);
                    }, 5000);
                });
            },
            
            queryParams: "Hello world!"
        }
    });
}
