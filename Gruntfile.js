module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            all: {
                files: ['src/**'],
                tasks: ['build']
            },
            script: {
                files: ['src/js/*.js', 'spec/**'],
                tasks: ['buildspec', 'spec']
            }
        },
        processhtml: {
            build: {
                files: {
                    'build/main.html': ['src/html/main.html']
                }
            },
            buildspec: {
                files: {
                    'build/spec.html': ['spec/spec.html']
                }
            }
        },
        mocha: {
            spec: {
                src: ['build/index.html'],
            },
        }
    });
    
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.registerTask('spec', ['mocha']);
    
    grunt.registerTask('buildspec', ['processhtml:buildspec']);
    grunt.registerTask('build', ['processhtml:build']);
};
