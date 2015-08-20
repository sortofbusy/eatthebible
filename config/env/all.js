'use strict';

module.exports = {
	app: {
		title: 'Eat The Bible',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/fontawesome/css/font-awesome.min.css',
				'public/lib/angular-busy/dist/angular-busy.css',
				'public/lib/angular-loading-bar/build/loading-bar.min.css',
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-busy/dist/angular-busy.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/biblejs/dist/bible.js',
				'public/lib/angular-loading-bar/build/loading-bar.min.js',
			]
		},
		css: [
			'public/modules/**/css/*.css',
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};