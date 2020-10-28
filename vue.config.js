const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

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
    node: {
      __dirname: true,
    },
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
    },
    module: {
      rules: [
        {
          test: path.resolve('src/environments/environment.ts'),
          loader: 'file-replace-loader',
          options: {
            condition: isProd,
            replacement: path.resolve('src/environments/environment.prod.ts'),
            async: false,
          },
        },
      ],
    },
  }),

  pluginOptions: {
    electronBuilder: {

      chainWebpackMainProcess: (config) => {
        config.module
          .rule('file-replace')
          .test(path.resolve('src/environments/environment.ts'))
          .use('file')
          .loader('file-replace-loader')
          .options({
            condition: isProd,
            replacement: path.resolve('src/environments/environment.prod.ts'),
            async: false,
          });
      },
      nodeIntegration: true,
      mainProcessFile: 'src/background/background.ts',
      mainProcessWatch: [
        'src/shared/**/*.ts',
        'src/store/**/*.ts',
        'src/background/**/*.ts',
        'src/browserMessages/**/*.ts',
        'src/environments/*.ts',
      ],
      // Do not preload script with vue CLI to avoid unnecessary reloading
      preload: isProd ? path.resolve(__dirname, 'dist_electron', 'preload.js') : undefined,
    },
  },
};
