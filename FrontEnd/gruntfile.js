module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        assemble: {
            options: {
                partials: ['src/partials/**/*.hbs'],
                layout: ['src/layouts/master.hbs']
            },
            site: {
                files: [{
                    expand: true,
                    cwd: 'src/pages/',
                    src: '**/*.hbs',
                    dest: 'dist/',
                    ext: '.html'
                }]
            }
        },

        favicons: {
            options: {
                trueColor: true,
                precomposed: true,
                appleTouchBackgroundColor: "none",
                coast: true,
                windowsTile: true,
                tileBlackWhite: false,
                tileColor: "auto",
                html: 'src/partials/favicon.hbs',
                HTMLPrefix: "/images/favicon/",
                indent:''
            },
            icons: {
                src: 'src/images/favicon/favicon.png',
                dest: 'dist/images/favicon'
            }
        },

        sprite:{
            icons: {
                src: ['src/images/icons/*.{png,gif}', '!src/images/favicon/*'],
                dest: 'dist/images/icon-sprite.png',
                imgPath: '/images/icon-sprite.png',
                destCss: 'src/css/includes/_icon-sprite.css'
            },
            sportsicons: {
                src: 'src/images/sports-icons/*.{png,gif}',
                dest: 'dist/images/sports-icon-sprite.png',
                imgPath: '/images/sports-icon-sprite.png',
                destCss: 'src/css/includes/_sports-icon-sprite.css'
            }
        },

        svg_sprite:{
            icons:{
                expand: true,
                cwd: 'src/images/svgIcons/',
                src: ['*.svg'],
                dest: '.',
                shape:{
                    dimension:{
                        maxWidth:32,
                        maxHeight:32
                    }
                },

                options:{
                    mode:{
                        inline: false,
                        symbol:{
                            bust: false,
                            dest: 'dist/',
                            sprite:'images/icons.svg'
                        },
                    }
                }
            }
        },

        bower_concat: {
            js: {
                dest: {
                    js : 'src/js/lib/bower.js'
                },
                mainFiles: {
                    'jquery-ui': [
                        'ui/core.js',
                        'ui/widget.js',
                        'ui/datepicker.js',
                        'ui/datepicker.js',
                        'ui/dialog.js',
                        'ui/button.js',
                        'ui/position.js',
                        'ui/tooltip.js',
                        'ui/mouse.js',
                        'ui/draggable.js'
                    ],
                    'jQuery-FormWatch':[
                        'jquery.formwatch.js'
                    ],
                    'blueimp-file-upload':[
                        'js/jquery.iframe-transport.js',
                        'js/jquery.fileupload.js',
                        'js/jquery.fileupload-process.js',
                        'js/jquery.fileupload-image.js',
                        'js/jquery.fileupload-audio.js',
                        'js/jquery.fileupload-video.js',
                        'js/jquery.fileupload-validate.js'
                    ],
                    'blueimp-canvas-to-blob':[
                        'js/canvas-to-blob.js'
                    ],
                    'blueimp-load-image':[
                        'js/load-image.all.min.js'
                    ],
                    'blueimp-tmpl':[
                        'js/tmpl.min.js'
                    ]
                },
                dependencies: {
                    'blueimp-file-upload': [
                        "jquery",
                        "jquery-ui"
                    ]
                }
            },
            scss: {
                dest: {
                    css : 'src/css/.tmp/bowerCSS.scss',
                    scss : 'src/css/.tmp/bowerSCSS.scss'
                },
                mainFiles: {
                    'jquery-ui': [
                        'themes/base/core.css',
                        'themes/base/datepicker.css',
                        'themes/base/dialog.css',
                        'themes/base/tooltip.css'
                    ]
                },
                include: [
                    'bourbon',
                    'fullcalendar',
                    'normalize-css',
                    'jquery-ui',
                    'neat',
                    'jt.timepicker',
                    'datepair.js'
                ]
            }
        },

        sass:{
            dev:{
                options: {
                    sourceMap: true,
                    sourceMapContents: true,
                    includePaths: [
                        'src/css/includes/',
                        'src/css/includes/custom',
                        'src/css/partials/',
                        'src/css/.tmp/',
                        'src/js/lib/bourbon/app/assets/stylesheets/',
                        'src/js/lib/neat/app/assets/stylesheets/'
                    ]
                },
                files: {
                    'dist/css/app.css': 'src/css/app.scss'
                }
            },
            production:{
                options: {
                    sourceMap: false,
                    sourceMapContents: false,
                    includePaths: [
                        'src/css/includes/',
                        'src/css/partials/',
                        'src/css/includes/custom',
                        'src/css/.tmp/',
                        'src/js/lib/bourbon/app/assets/stylesheets/',
                        'src/js/lib/neat/app/assets/stylesheets/'
                    ],
                    outputStyle: 'compressed'
                },
                files: {
                    'dist/css/app.css': 'src/css/app.scss'
                }
            }
        },

        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 3,
                    svgoPlugins: [{ removeViewBox: false }]
                },
                files: [{
                    expand: true,
                    cwd: 'src/images',
                    src: ['**/*.{png,jpg,gif}', '!*{I,i}cons/*', '!*favicon*/*'],
                    dest: 'dist/images/'
                }]
            }
        },

        uglify: {
            dev:{
                options: {
                    mangle: false,
                    sourceMap: true,
                    sourceMapIncludeSources: true,
                    compress: false
                },
                files: {
                    'dist/js/app.js': [
                        'src/js/lib/bower.js',
                        'src/js/config.js',
                        'src/js/_variablesDEV.js',
                        'src/js/helpers/*.js',
                        'src/js/comps/*.js',
                        'src/js/forms/*.js'
                    ]
                }
            },
            production:{
                options: {
                    mangle: true,
                    sourceMap: false,
                    compress: {
                        drop_console: true
                    }
                },
                files: {
                    'dist/js/app.js': [
                        'src/js/lib/bower.js',
                        'src/js/config.js',
                        'src/js/_variablesPROD.js',
                        'src/js/helpers/*.js',
                        'src/js/comps/*.js',
                        'src/js/forms/*.js'
                    ]
                }
            },
        },

        robotstxt: {
            dist: {
                dest: 'dist/',
                policy: [
                    {
                        ua: '*',
                        disallow: '/'
                    }
                ]
            }
        },

        humans_txt: {
            all: {
                options: {
                    commentStyle: 'u',
                    content: {
                        'team': [
                            {
                                'Web developer': 'Ricardo Cunha',
                                'Location': 'NY'
                            },{
                                'Web developer': 'Surabhi Mendiratta',
                                'Location': 'NY'
                            },{
                                'Designer': 'Mike Hirst',
                                'Location': 'NY'
                            }
                        ],
                        'site': [
                            {
                                'Language': 'English',
                                'Technology': 'node.js, nginx, aws, mssql'
                            }
                        ]
                    }
                },
                dest: 'dist/humans.txt'
            }
        },

        clean: {
            options: {
                force: true
            },
            default:[
                'src/css/includes/_icon-sprite.css',
                'src/css/includes/_sports-icon-sprite.css',
                'src/css/.tmp',
                'src/partials/favicon.hbs',
                'src/js/lib/bower.js'
            ],
            html: ['dist/**/*.html'],
            js: ['dist/**/*.{js,js.map}'],
            css: ['dist/**/*.{css,css.map}'],
            images: ['dist/**/*.{png,jpg,gif,svg,ico}'],
            svgs: ['dist/**/*.svg']
        },

        connect: {
            server: {
                options: {
                    open: 'http://localhost:8080/welcome.html',
                    protocol: 'http',
                    port: 8080,
                    base: {
                        path: 'dist',
                        options: {
                            maxAge: 0,
                            etag: false,
                            setHeaders: function(res, path){
                                res.setHeader('Cache-Control', 'public, max-age=0')
                            }
                        }
                    },
                    livereload: true
                },
            },
        },

        watch: {
            options: {
                livereload: true,
                event: ['changed', 'added', 'deleted']
            },
            css: {
                files: ['src/css/**/*.scss'],
                tasks: ['clean:css', 'sprite', 'bower_concat:scss', 'sass:dev', 'clean:default']
            },
            js: {
                files: ['src/js/**/*.js', '!src/js/lib/**/*.js'],
                tasks: ['clean:js', 'bower_concat:js', 'uglify:dev', 'clean:default']
            },
            html: {
                files: ['src/**/*.hbs'],
                tasks: ['clean:html', 'favicons', 'assemble']
            },
            images: {
                files: ['src/images/**/*.{png,jpg,gif}', '!src/images/icons/*'],
                tasks: ['clean:images', 'favicons', 'imagemin']
            },
            svgs: {
                files: ['src/images/**/*.svg}'],
                tasks: ['clean:svgs', 'svg_sprite','clean:default']
            },
            sprites: {
                files: ['src/images/*icons/*'],
                tasks: ['clean:images', 'imagemin', 'clean:css', 'sprite' ,'sass:dev' ,'clean:default']
            }
        }
    });

    grunt.registerTask('default', [
        'clean',
        'favicons',
        'assemble',
        'sprite',
        'svg_sprite',
        'imagemin',
        'bower_concat',
        'sass:dev',
        'uglify:dev',
        'clean:default',
        'connect',
        'watch']
    );

    grunt.registerTask('prod', [
        'clean',
        'favicons',
        'assemble',
        'sprite',
        'svg_sprite',
        'imagemin',
        'bower_concat',
        'sass:production',
        'uglify:production',
        'robotstxt',
        'humans_txt',
        'clean:default']
    );

};
