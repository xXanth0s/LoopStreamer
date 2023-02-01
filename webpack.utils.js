const webpack = require('webpack');
const path = require('path');

const config = {
    entry: path.resolve(__dirname, 'src', 'content', 'ustils', 'dom.utils.ts'),
    output: {
        path: path.resolve(__dirname, 'dist-utils'),
        filename: 'bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [
            '.tsx',
            '.ts',
            '.js'
        ]
    }
};

module.exports = config;
