if (window.developmentMode) {
    // In development mode, synchronously fetch the template locally.
    
    module.exports = function(name) {
        var path = "../src/components/" + name;
        
        var req = new XMLHttpRequest();
        req.open("GET", path, false);
        req.send(null);
        
        if (req.responseText) {
            return req.responseText;
        }
        else {
            throw new Error("Unknown template: " + name);
        }
    };
    
} else {
    // In production mode, look in the merged template file we generate at build time.
    module.exports = require("../build/template.js");
}
