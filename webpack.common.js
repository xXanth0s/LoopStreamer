/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const extensionPath = 'extension';

module.exports = {
    entry: {
        'js/content': path.resolve(__dirname, 'src', 'content', 'main.ts'),
        // 'extension/background': path.resolve(__dirname, 'src', 'background', 'main.ts'),
        // 'extension/content': path.resolve(__dirname, 'src', 'content', 'main.ts'),
    },
    target: 'electron-preload',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist_electron'),
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        },
        // extensions: ['.ts', '.tsx', '.js'],
        extensions: ['.ts', '.tsx', '.js', '.vue'],
    },

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.tsx?$/,
                use: [
                    // {
                    //     loader: 'babel-loader'
                    // },
                    {
                        loader: 'ts-loader',
                        // options: {
                        //     transpileOnly: true,
                        //     appendTsSuffixTo: [
                        //         '\\.vue$'
                        //     ],
                        //     happyPackMode: false
                        // }
                    }
                ],
                // options: {
                //     appendTsSuffixTo: [/\.vue$/],
                // }
            },
            // {
            //     test: /\.tsx?$/,
            //     exclude: /node_modules/,
            //     loader: 'babel-loader',
            // },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        //
        // new ExtensionReloader({
        //   entries: { // The entries used for the content/background scripts or extension pages
        //     contentScript: 'content',
        //     background: 'background',
        //   },
        //   reloadPage: false,
        // }),
        new CopyPlugin([
            {
                from: 'assets',
                to: 'assets',
            },
            {
                from: 'extensions',
                to: 'extensions',
            },
            {
                from: 'state.json',
                to: 'state.json',
            },
        ]),
    ],
};
