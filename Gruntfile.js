'use strict';

var path = require('path');

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        connect: {
            options: {
                port: 2915
            },
            test: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static(path.resolve('test/server'))
                        ];
                    }
                }
            }
        },
        watch: {
            test: {
                files: ['lib/**/*.js', 'test/**/*.js'],
                tasks: ['shell:test']
            }
        },
        jsdoc : {
            dist : {
                src: ['src/**/*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                'src/**/*.js'
            ]
        },
        shell: {
            test: {
                command: 'mocha --reporter spec --colors test/*.js',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        }
    });

    grunt.registerTask('test', function(target) {
        var tasks = ['jshint', 'connect:test', 'shell:test'];

        if (target === 'live') {
            tasks.push('watch:test');
        }

        grunt.task.run(tasks);
    });

    grunt.registerTask('default', ['test']);
};
