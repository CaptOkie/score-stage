var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: {
        'login': './src/pages/login-page/index.js',
        'home': './src/pages/home-page/index.js',
        'music-score': './src/pages/music-score-page/index.js'
    },
    output: {
        path: path.resolve(__dirname, '../score-stage-server/WebContent/resources/'),
        filename: '[name]/index.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this nessessary.
                        scss: ExtractTextPlugin.extract({ loader: 'css-loader!sass-loader', fallbackLoader: 'vue-style-loader' }),
                        sass: ExtractTextPlugin.extract({ loader: 'css-loader!sass-loader?indentedSyntax', fallbackLoader: 'vue-style-loader' }),
                        css: ExtractTextPlugin.extract({ loader: 'css-loader', fallbackLoader: 'vue-style-loader' })
                    }
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    name: 'imgs/[name].[ext]',
                    publicPath: 'res/'
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({ loader: 'css-loader' })
            }
        ]
    },
    resolve: {
        alias: {
          'vue$': 'vue/dist/vue.common.js',
          'Proxies' : path.resolve(__dirname, 'src/proxies'),
          'Components' : path.resolve(__dirname, 'src/components'),
          'Directives' : path.resolve(__dirname, 'src/directives'),
          'Services' : path.resolve(__dirname, 'src/services'),
          'Common' : path.resolve(__dirname, 'src/common')
        }
    },
    performance: {
        hints: false
    },
    devtool: 'eval-source-map',
    plugins: [
        new ExtractTextPlugin({ filename: '[name]/index.css', disable: false, allChunks: true })
    ]
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = 'nosources-source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}