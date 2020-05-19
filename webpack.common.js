/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const extensionPath = 'extension';

module.exports = {
  entry: {
    'js/content': [
      './src/content/main.ts',
    ],
    'extension/background': './extension/background/main.ts',
    'extension/content': './extension/content/main.ts',
  },
  target: 'electron-preload',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist_electron'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
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
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),

    new ExtensionReloader({
      entries: { // The entries used for the content/background scripts or extension pages
        contentScript: 'extension/content',
        background: 'extension/background',
      },
      reloadPage: false,
    }),
    new CopyPlugin([
      {
        from: 'assets',
        to: 'assets',
      },
      {
        from: 'assets',
        to: 'extension/assets',
      },
      {
        from: './extension/_locales',
        to: 'extension/_locales',
      },
      {
        from: './extension/manifest.json',
        to: 'extension/manifest.json',
      },
    ]),
  ],
};
