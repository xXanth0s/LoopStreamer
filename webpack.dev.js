/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.(svg|eot|woff|woff2|ttf)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        outputPath: 'fonts',
                        name: '[name].[ext]',
                        publicPath: 'http://localhost:8080/fonts/',
                    },

                }],
            },
        ],
    },
});

