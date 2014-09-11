var fs = require("fs");
var path = require("path");

var eachFile = function(dir, fn) {
    var files = fs.readdirSync(dir);
      
    if (files) {
        while (files.length > 0) {
            var f = files.pop();
            fn(path.join(dir, f));
        }
    }
};

module.exports = function(grunt) {
    grunt.registerTask('dev_index', function() {
        var stream = fs.createWriteStreamSync('build/index.html');
        
        var dir = "src/html/templates";
        
        var templates = {};
        
        
        var js = "";
        js += "var templates = " + JSON.stringify(templates) + "; ";
        js += "module.exports = function(name) { return templates[name] };";
        
        fs.writeFileSync("build/template.js", js);
    });
};
