var fs = require("fs");
var path = require("path");

module.exports = function(grunt) {
    grunt.registerTask('include_templates', function() {
        var dir = "src/html/templates";
        var files = fs.readdirSync(dir);
        
        var templates = {};
        
        if (files) {
            while (files.length > 0) {
                var f = files.pop();
                
                var basename = path.basename(f, ".html");
                templates[basename] = fs.readFileSync(path.join(dir, f), "utf-8");
            }
        }
        
        var js = "";
        js += "var templates = " + JSON.stringify(templates) + "; ";
        js += "module.exports = function(name) { return templates[name] };";
        
        fs.writeFileSync("build/template.js", js);
    });
};
