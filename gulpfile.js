
var gulp = require( 'gulp' );
var debugPipe = require( 'gulp-debug' );
var less = require( 'gulp-less' );
var devserver = require( 'gulp-server-livereload' );
var sourcemaps = require( 'gulp-sourcemaps' );
var jsonfile = require( 'jsonfile' );
var path = require( 'path' );
var rimraf = require( 'rimraf' );
var runSequence = require( 'run-sequence' );
var webpack = require( 'webpack-stream' );
var argv = require( 'yargs' ).argv;


var server_params = {
	www_port: 8802,
	reload_port: 6835
};

var paths = {
	app_entry: [
		'src/app/loader.js'
	],
	app_src: [
		'src/**/*'
	],
	app_less: [
		'src/styles/theme/theme.less'
	],
	app_less_resolve: [
		'node_modules',
		'src/styles/theme'
	],
	statics: [
		'src/app/index.html'
	],
	tsd_files: [
		'src/typings/tsd.d.ts',
		'src/typings/lib.d.ts',
		'src/typings/app.d.ts'
	],
	build_dir: 'dist'
};



function swallow( error ) {
	console.error( error );
	this.emit( 'end' );
}

gulp.task( 'clean', function( done ) {
	rimraf( path.join( paths.build_dir, '**', '*' ), done );
});

gulp.task( 'copy', function() {
	return gulp.src( paths.statics )
		.pipe( gulp.dest( paths.build_dir ));
});

gulp.task( 'less', function() {
	return gulp.src( paths.app_less )
		.pipe( less({
			paths: paths.app_less_resolve
		}))
		.pipe( gulp.dest( paths.build_dir ));
});

gulp.task( 'webpack', function() {
	// rewrite tsconfig.webpack.json
	var tsconfig = jsonfile.readFileSync( 'tsconfig.json' );
	tsconfig.files = paths.tsd_files;
	jsonfile.writeFileSync( 'tsconfig.webpack.json', tsconfig );
	//
	var webpack_config = require( './webpack.config.js' );
	if (argv.release) {
		delete webpack_config.debug;
		delete webpack_config.devtool;
	}
	if (argv.watch)
		webpack_config.watch = true;
	//
	return gulp.src( paths.app_entry )
		.pipe( webpack( webpack_config ))
		.on( 'error', swallow )
		.pipe( sourcemaps.init() )
		.pipe( sourcemaps.write( '.' ))
		.pipe( gulp.dest( paths.build_dir ));
});

gulp.task( 'serve', function() {
	return gulp.src( paths.build_dir )
		.pipe( devserver({
			port: server_params.www_port,
			livereload: {
				enable: argv.watch,
				port: server_params.reload_port
			},
			open: false
		}));
});

gulp.task( 'default', function( done ) {
	if (argv.watch) {
		gulp.watch( paths.statics, [ 'copy' ]);
		runSequence(
			'clean',
			[ 'copy', 'less' ],
			[ 'webpack', 'serve' ]
		);
	} else {
		runSequence(
			'clean',
			[ 'copy', 'less', 'webpack' ],
			argv.serve ? 'serve' : done
		);
	}
});
