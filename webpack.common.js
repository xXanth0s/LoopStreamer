/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'js/content': [
      path.resolve(__dirname, 'src', 'content', 'main.ts'),
    ],
  },
  target: 'electron-preload',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist_electron'),
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
    },
    extensions: ['.ts', '.tsx', '.js', '.json', '.vue'],
  },

  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              esModule: true,
              injectType: 'lazyStyleTag',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [
            '\\.vue$',
          ],
          happyPackMode: false,
        },
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
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
