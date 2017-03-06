const webpack = require('webpack');
const { version } = require('./package.json');

module.exports = {
    entry: './src/js/videojs-dash.js',
    output: {
        path: __dirname + '/dist',
        filename: 'videojs5-dashjs-p2p-source-handler.js',
        libraryTarget: 'umd',
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
        noParse: [
            /node_modules\/streamroot-dashjs-p2p-bundle\/dashjs-p2p-bundle.js/,
            /node_modules\/streamroot-p2p\/p2p.js/,
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(`v${version}`)
        }),
        // commented out UglifyJsPlugin because it freezes build at `91% additional asset processing`
        // new webpack.optimize.UglifyJsPlugin(),
    ]
};
