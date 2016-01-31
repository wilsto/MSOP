module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        copy: {
            buildcss: {
                cwd: 'css',
                src: ['**/*'],
                dest: 'dist/build/css',
                expand: true
            },
            buildjs: {
                cwd: 'js',
                src: ['**/*'],
                dest: 'dist/build/js',
                expand: true
            }
        },


        clean: {
            build: {
                src: ['dist'],
                force: true
            },
        },


        jshint: {
            src: ['Gruntfile.js',
                'js/app.js',
                'js/Controller/*.js'
            ]
        },


        csslint: {
            lax: {
                options: {
                    import: false
                },
                src: ['dist/build/css/MSOP.css']
            }
        },


        comments: {
            build: {
                options: {
                    singleline: true,
                    multiline: true
                },
                src: ['dist/build/css/**/*.css']
            },
        },


        cssmin: {
            build: {
                files: {
                    'dist/min.css': [
                        'dist/build/css/MSOP.css',
                        'dist/build/css/jbclock.css',
                        'bower_components/angular-xeditable/dist/css/xeditable.css',
                        'bower_components/nsPopover/src/nsPopover.css'
                    ]
                }
            }
        },


        uglify: {
            build: {
                options: {
                    mangle: false,
                },
                files: {
                    'dist/min.js': [
                        'dist/build/js/mustache.min.js',
                        'dist/build/js/jquery.notif.js',
                        'dist/build/js/angular.easypiechart.min.js',
                        'dist/build/js/jbclock.js',
                        'dist/build/js/app.js',
                        'dist/build/js/Controller/*.js',
                        'bower_components/angular-xeditable/dist/js/xeditable.js',
                        'bower_components/momentjs/min/moment.min.js',
                        'bower_components/momentjs/min/locales.min.js',
                        'bower_components/humanize-duration/humanize-duration.js',
                        'bower_components/angular-timer/dist/angular-timer.js',
                        'bower_components/underscore/underscore-min.js',
                        'bower_components/nsPopover/src/nsPopover.js'
                    ]
                }
            }
        },


        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'index.html'
                }
            }
        },

        // Remove unused CSS across multiple files, compressing the final output
        uncss: {
            dist: {
                files: [{
                    src: ['index.html'],
                    dest: 'dist/compiled.min.css'
                }]
            },
            options: {
                compress: true,
                stylesheets: ["dist/min.css"],
            }
        },

        watch: {
            files: ['Gruntfile.js', 'js/**/*.js', 'css/**/*.css'],
            tasks: ['default'],
            options: {
                livereload: true,
            }
        }
    });

    grunt.registerTask('default', [
        'jshint',
        'clean',
        'copy',
        'comments',
        'cssmin',
        'uglify',
        'htmlmin',
        'watch'
    ]);


    grunt.registerTask('build', [
        'jshint',
        'clean',
        'copy',
        'comments',
        'cssmin',
        'uglify',
        'htmlmin',
        'uncss',
        'watch'
    ]);
};