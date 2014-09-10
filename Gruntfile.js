module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            all: {
                files: ['src/html/**', 'src/css/**'],
                tasks: ['build']
            },
            script: {
                files: ['src/js/*.js', 'spec/**'],
                tasks: ['test', 'build']
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
            test: {
                src: ['spec/**/*.js'],
                options: {
                    reporter: 'spec',
                    require: 'chai'
                }
            },
        },
        browserify: {
            app: {
                src: ['src/js/main.js'],
                dest: 'build/app.js',
                options: {
                    alias: ['./build/template.js:template']
                }
            }
        },
        cssmin: {
            combine: {
                files: {'build/style.css' : ['src/css/*.css']}
            }
        }
     });
    
    
    // Development Dependencies
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    
    // Project Tasks
    grunt.loadTasks('tasks');
    
    // Build Events
    grunt.registerTask('build', ['include_templates', 'cssmin', 'browserify:app', 'processhtml:build']);
    grunt.registerTask('test', ['mochaTest']);
};
