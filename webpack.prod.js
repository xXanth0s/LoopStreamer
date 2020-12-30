/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {

    mode: 'production',
    module: {
        rules: [
            {
                test: /\.(svg|eot|woff|woff2|ttf)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        outputPath: 'fonts',
                        name: '[name].[ext]',
                        publicPath: 'app://./fonts/',
                    },

                }],
            },
            {
                test: path.resolve('src/environments/environment.ts'),
                loader: 'file-replace-loader',
                options: {
                    replacement: path.resolve('src/environments/environment.prod.ts'),
                    async: false,
                },
            },
        ],
    },
});
