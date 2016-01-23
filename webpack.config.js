
var path = require( 'path' );
var webpack = require( 'webpack' );
var omit = require( 'underscore' ).omit;

var project_root = __dirname;
var app_src = path.join( project_root, 'src' );


function loaderConfig( name, json ) {
	var config = ({
		babel: {
			cacheDirectory: '.babel',
			presets: [ 'es2015', 'react' ],
			plugins: [ 'react-require' ],
			sourceMap: false
		},
		global_style: {
			_loader: 'file',
			name: '[name].[ext]'
		},
		file: {
			name: 'assets/[hash].[ext]'
		},
		typescript: {
			_loader: 'ts',
			configFileName: 'tsconfig.webpack.json'
		},
		url: {
			limit: 1024,
			name: 'assets/[hash].[ext]'
		}
	})[name];
	if (json)
		config = JSON.stringify( omit( config, [ '_loader' ] ));
	return config;
}

function loader( name ) {
	// load and use config, if available
	var config = loaderConfig( name );
	if (config) {
		var loader = config._loader || name;
		return loader + '?' + loaderConfig( name, true );
	} else {
		// no configuration; passthrough
		return name;
	}
}


module.exports = {
	context: app_src,
	devtool: 'source-map',
	output: {
		filename: 'app.js',
		publicPath: '/'
	},
	resolve: {
		root: app_src,
		modulesDirectories: [ 'submodules', 'node_modules' ],
		extensions: [ '', '.tsx', '.ts', '.jsx', '.js' ]
	},
	plugins: [
		new webpack.optimize.DedupePlugin()
	],
	postcss: function( webpack ) {
		return [
			require( 'postcss-import' )({
				addDependencyTo: webpack,
				path: [ 'src', 'src/styles' ]
			}),
			require( 'postcss-url' )({
				url: 'inline',
				maxSize: 1024,
				assetsPath: 'dist',
				useHash: true
			}),
			require( 'postcss-simple-mixin' ),
			require( 'postcss-cssnext' )({
				browsers: [
					"last 2 versions",
					"ie >= 9"
				]
			})
		];
	},
	module: {
		loaders: [
			{  // TypeScript and TSX support (via babel)
				test: /.+\.tsx?$/,
				include: app_src,
				loaders: [
					loader( 'babel' ),
					loader( 'typescript' )
				]
			},
			{  // ES6 and JSX syntax for plain JavaScript
				test: /.+\.jsx?$/,
				include: app_src,
				loader: loader( 'babel' )
			},
			{ // globally scoped stylesheets
				test: /.+\.css$/,
				include: path.join( app_src, 'styles', 'global' ),
				loaders: [
					'style/url',
					loader( 'global_style' ),
					'postcss'
				]
			},
			{ // locally scoped stylesheets
				test: /.+\.css$/,
				include: path.join( app_src, 'styles' ),
				exclude: [
					path.join( app_src, 'styles', 'global' ),
					path.join( app_src, 'styles', 'theme' )
				],
				loaders: [ 'style/useable', 'css?modules', 'postcss' ]
			},
			{  // misc files
				test: /.+\.(png|gif|jp(e?)g|svg)$/,
				loader: loader( 'url' )
			}
		]
	}
};
