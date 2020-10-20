const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  lintOnSave: false,
  filenameHashing: false,
  outputDir: `${__dirname}/dist_electron`,
  pages: {
    index: {
      // entry for the page
      entry: 'src/app/src/main.ts',
      // the source template
      template: 'src/app/public/index.html',
      // output as dist/index.html
      filename: 'index.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'LoopStreamer',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },
    background: 'src/background/background.ts',

  },
  configureWebpack: () => ({
    devtool: 'source-map',
  }),

  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      mainProcessFile: 'src/background/background.ts',
      mainProcessWatch: [
        'src/shared/**/*.ts',
        'src/store/**/*.ts',
        'src/background/**/*.ts',
        'src/browserMessages/**/*.ts',
      ],
      preload: path.resolve(__dirname, 'src', 'content', 'main.ts'),

      chainWebpackMainProcess: (config) => {
      },

      chainWebpackRendererProcess: (config) => {
        config.merge({
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
          ]
        });
      }
    },
  },
};
