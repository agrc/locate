module.exports = function (grunt) {
    var jsFiles = 'lib/app/**/*.js';
    var otherFiles = [
        'lib/app/**/*.html',
        'lib/app/**/*.svg',
        'lib/app/**/*.png',
        'lib/index.html',
        'lib/report.html',
        'lib/ChangeLog.html'
    ];
    var gruntFile = 'GruntFile.js';
    var eslintFiles = [
        jsFiles,
        gruntFile
    ];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'lib/app/package.json',
        'lib/app/config.js'
    ];
    var deployFiles = [
        '**',
        '!**/*.uncompressed.js',
        '!**/*consoleStripped.js',
        '!**/bootstrap/less/**',
        '!**/bootstrap/test-infra/**',
        '!**/tests/**',
        '!build-report.txt',
        '!components-jasmine/**',
        '!favico.js/**',
        '!jasmine-favicon-reporter/**',
        '!jasmine-jsreporter/**',
        '!stubmodule/**',
        '!util/**'
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: true,
                presets: ['@babel/preset-env'],
                plugins: [['@babel/plugin-transform-modules-commonjs', { strictMode: false }]]
            },
            src: {
                files: [{
                    expand: true,
                    cwd: 'lib/app/',
                    src: ['**/*.js'],
                    dest: 'src/app/'
                }]
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat(['lib/ChangeLog.html']),
                push: false
            }
        },
        cachebreaker: {
            main: {
                options: {
                    match: [
                        'dojo/dojo.js',
                        'app/resources/App.css',
                        'app/run.js'
                    ]
                },
                files: {
                    src: ['dist/*.html']
                }
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy'],
            src: ['src/app']
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            dist: {
                files: [{ expand: true, cwd: 'src/', src: ['*.html', 'web.config'], dest: 'dist/' }]
            },
            src: {
                expand: true,
                cwd: 'lib',
                src: ['**/*.*', '!**/*.js', '!**/*.styl', 'ChangeLog.html', 'index.html', 'report.html', 'web.config'],
                dest: 'src'
            }
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                // You can also specify options to be used in all your tasks
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                requires: ['src/app/packages.js', 'src/app/run.js'],
                basePath: './src'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            main: {
                src: jsFiles
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    // exclude tests because some images in dojox throw errors
                    src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                    dest: 'src/'
                }]
            }
        },
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/packages.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js'
                    ],
                    host: 'http://localhost:8000',
                    keepRunner: true
                }
            }
        },
        processhtml: {
            options: {},
            main: {
                files: {
                    'dist/index.html': ['src/index.html'],
                    'dist/report.html': ['src/report.html']
                }
            }
        },
        stylus: {
            src: {
                options: {
                    compress: false,
                    urlfunc: 'data-uri'
                },
                files: [{
                    expand: true,
                    cwd: 'lib/app/',
                    src: ['**/*.styl'],
                    dest: 'src/app/',
                    ext: '.css'
                }]
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.js', '!proj4/**/*.js'],
                    dest: 'dist'
                }]
            }
        },
        watch: {
            eslint: {
                files: eslintFiles,
                tasks: ['eslint:main', 'jasmine:main:build', 'newer:babel', 'newer:copy:src']
            },
            src: {
                files: eslintFiles.concat(otherFiles),
                options: {
                    livereload: true
                },
                tasks: ['newer:copy:src']
            },
            stylus: {
                files: 'lib/app/**/*.styl',
                options: {
                    livereload: true
                },
                tasks: ['stylus:src']
            }
        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) {
            grunt.loadNpmTasks(key);
        }
    }

    // Default task.
    grunt.registerTask('default', [
        'eslint',
        'clean:src',
        'babel',
        'stylus:src',
        'copy:src',
        'connect',
        'jasmine:main:build',
        'watch'
    ]);
    grunt.registerTask('build-prod', [
        'clean:src',
        'babel',
        'stylus:src',
        'copy:src',
        'newer:imagemin:main',
        'dojo:prod',
        'uglify:prod',
        'copy:dist',
        'processhtml:main',
        'cachebreaker'
    ]);
    grunt.registerTask('build-stage', [
        'clean:src',
        'babel',
        'stylus:src',
        'copy:src',
        'newer:imagemin:main',
        'dojo:stage',
        'uglify:stage',
        'copy:dist',
        'processhtml:main',
        'cachebreaker'
    ]);
    grunt.registerTask('test', [
        'babel',
        'copy:src',
        'connect',
        'jasmine'
    ]);
    grunt.registerTask('travis', [
        'eslint',
        'test',
        'build-prod'
    ]);
};
