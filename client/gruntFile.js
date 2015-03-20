/* global module */
'use strict';

module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
//	grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-contrib-less');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');


	grunt.registerTask('warning', function() { 
		grunt.log.warn(
			'You Must have the webserver started and running on port 8000'
		);
	});
	grunt.registerTask('test-unit', ['karma:unit']);
	grunt.registerTask('test-e2e', ['warning','karma:e2e']);
	grunt.registerTask('build', 
	['clean','html2js','concat',
	'less:compile', 'copy:assets', 'copy:server']);
	grunt.registerTask('release', 
	['clean','html2js','uglify',
	'jshint','concat:index',
        'less:compile', 'copy:assets', 'copy:server']);
	grunt.registerTask('default', ['jshint','build', 'karma:e2e', 'copy:server']);



		grunt.initConfig({
			distdir: 'dist',
            serverdir: '../server/public',

			pkg: grunt.file.readJSON('package.json'),
			banner: '/*! ' + 
				'<%= pkg.title || pkg.name %> ' + 
				'- v<%= pkg.version %> ' + 
				'- <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
				'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' + 
				' * Copyright (c) <%= grunt.template.today("yyyy") %>' + 
				' <%= pkg.author %>;\n' + 
				' * Licensed ' + 
				'<%= _.pluck(pkg.licenses, "type").join(", ") %>\n' + 
				' */\n',
			src : {
				js : 'src/**/*.js',
				templates: '<%= distdir %>/templates/**/*.js',
				tpl: {
					app: ['src/app/**/*.tpl.html'],
					common: ['src/common/**/*.tpl.html']
				},
				test : {
					unit : 'test/unit/**/*.js',
					e2e : 'test/e2e/**/*.js'
				},
				assets : 'src/assets/',
				//can't use ** on recess so will need to update this manually
				less : [
				'src/less/stylesheet.less'
				],
				html : 'src/index.html',
				angular : {
					base: 'vendor/angular/angular.js',
                    base_route: 'vendor/angular/route-angular.js',
					extensions: 'vendor/angular/angular-*.js'
				}
			},
			watch:{
				all: {
					files:[
						'<%= src.js %>', 
						'<%= src.test.unit %>', 
						'<%= src.less %>', 
						'<%= src.tpl.app %>', 
						'<%= src.tpl.common %>', 
					'<%= src.html %>'],
					tasks:['default']
				},
				build: {
					files:[
						'<%= src.js %>', 
						'<%= src.test.unit %>', 
						'<%= src.less %>', 
						'<%= src.tpl.app %>', 
						'<%= src.tpl.common %>', 
					'<%= src.html %>'],
					tasks:['build']
				}
			},
			karma: {
				options : {
					plugins : [
						'karma-junit-reporter',
						'karma-chrome-launcher',
						'karma-firefox-launcher',
						'karma-jasmine',
						'karma-ng-scenario'    
					],
					browsers : ['Chrome']
				},
				unit: {
					options : {
						files : [
							'<%= src.angular.base %>',
							'<%= src.angular.extensions %>',
							'test/vendor/angular/angular-mocks.js',
							'<%= src.js %>',
							'<%= src.test.unit %>'
						],
						autoWatch : false,
						singleRun : true,
						frameworks: ['jasmine'],

						junitReporter : {
							outputFile: 'test_out/unit.xml',
							suite: 'unit'
						}
					}
				},
				e2e: {
					options : {
						files : [
							'<%= src.test.e2e %>'
						],
						autoWatch : false,
						frameworks: ['ng-scenario'],
						singleRun : true,
						proxies : {
							'/': 'http://localhost:8000/'
						},

						junitReporter : {
							outputFile: 'test_out/e2e.xml',
							suite: 'e2e'
						}	
					}
				}
			},
			jshint: {
				files : [
					'<%= src.js %>', 
					'gruntFile.js',
				'package.json'],
				options: {
					camelcase : false,
						smarttabs : true,
						curly : true,
						eqeqeq : true,
						forin : true,
						immed : true,
						latedef : true, 
						newcap : false,
						noarg : true,
						noempty : true,
						nonew : true,
						undef : true,
						unused : "vars",
						globalstrict : true,
						maxdepth : 3,
						globals : {"angular" : true, "console": true}
				} 
			},
			html2js: {
				app: {
					options: {
						base: 'src/app'
					},
					src: ['<%= src.tpl.app %>'],
					dest: '<%= distdir %>/templates/app.js',
					module: 'templates.app'
				},
				common: {
					options: {
						base: 'src/common'
					},
					src: ['<%= src.tpl.common %>'],
					dest: '<%= distdir %>/templates/common.js',
					module: 'templates.common'
				}
			},
			clean: ['<%= distdir %>/*'],
			copy: {
				assets: {
					files: [{ 
						dest: '<%= distdir %>', 
						src : '**',
                        cwd: '<%= src.assets %>',
					expand: true}]
				},
                server: {
                    files: [{
                        dest: '<%= serverdir %>',
                        src : '**',
                        cwd: '<%= distdir %>',
                        expand: true}]
                }

			},

            less: {
                compile: {
                    options: {
                        cleancss: true,
                        report: 'min',
                        strictMath: true,
                        sourceMap: true,
                        outputSourceFiles: true
                    },
                    files: {
                        'dist/css/<%= pkg.name %>.min.css': '<%= src.less %>'
                    }
                }
            },
			uglify: {
                dist:{
                    options: {
                        banner: "<%= banner %>"
                    },
                    src:['<%= src.js %>','<%= src.templates %>'],
                    dest:'<%= distdir %>/js/<%= pkg.name %>.js'
                },

                angular : {
                    src : [
                        '<%= src.angular.base %>',
                        '<%= src.angular.base_route %>',
                        '<%=src.angular.extensions %>'],
                    dest : '<%= distdir %>/js/angular.js'
                },

                jquery: {
                    src: ['vendor/jquery/*.js'],
                    dest: '<%= distdir %>/js/jquery.js'
                },
                bootstrap: {
                    src: ['vendor/bootstrap/js/*.js'],
                    dest: '<%= distdir %>/js/bootstrap.js'
                },
                ui_bootstrap: {
                    src: ['vendor/ui-bootstrap/*.js'],
                    dest: '<%= distdir %>/js/ui-bootstrap.js'
                },
                handsontable: {
                    src: ['vendor/handsontable/*.js'],
                    dest: '<%= distdir %>/js/handsontable.js'
                }
            },
			concat:{
				dist:{
					options: {
						banner: "<%= banner %>"
					},
					src:['<%= src.js %>','<%= src.templates %>'],
					dest:'<%= distdir %>/js/<%= pkg.name %>.js'
				},
				index: {
					src: ['src/index.html'],
					dest: '<%= distdir %>/index.html',
					options: {
						process: true
					}
				},
				angular : {
					src : [
						'<%= src.angular.base %>',
                        '<%= src.angular.base_route %>',
                        '<%=src.angular.extensions %>'],
					dest : '<%= distdir %>/js/angular.js'
				},

                jquery: {
                    src: ['vendor/jquery/*.js'],
                    dest: '<%= distdir %>/js/jquery.js'
                },
				bootstrap: {
                    src: ['vendor/bootstrap/js/*.js'],
                    dest: '<%= distdir %>/js/bootstrap.js'
                },
                ui_bootstrap: {
                    src: ['vendor/ui-bootstrap/*.js'],
                    dest: '<%= distdir %>/js/ui-bootstrap.js'
                },
                handsontable: {
                    src: ['vendor/handsontable/*.js'],
                    dest: '<%= distdir %>/js/handsontable.js'
                }
            }
		});
};
