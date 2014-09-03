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
                tasks: ['spec']
            }
        },
        processhtml: {
            build: {
                files: {
                    'build/index.html': ['src/html/main.html']
                },
                options: {
                    includeBase: '.'
                }
            }
        },
        mochaTest: {
            spec: {
                src: ['spec/**/*.js'],
                options: {
                    reporter: 'spec'
                }
            },
        },
        browserify: {
            app: {
                src: ['src/js/*.js'],
                dest: 'build/app.js'
            }
        }
    });
    
    
    // Development Dependencies
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    
    grunt.registerTask('build', ['browserify:app', 'processhtml:build']);
    grunt.registerTask('spec', ['mochaTest']);
};
