module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            dev: {
                files: ['src/css/*'],
                tasks: ['cssmin']
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
        watchify: {
            app: {
                src: ['./src/**/*.js'],
                dest: 'build/app.js'
            }
        },
        cssmin: {
            combine: {
                files: {
                    'build/style.css': ['src/css/*.css']
                }
            }
        }
    });


    // Development Dependencies
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-watchify');

    // Project Tasks
    grunt.loadTasks('tasks');

    // Build Events
    grunt.registerTask('dev', ['watchify', 'watch']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('roots', ['cssmin', 'processhtml']);
};
