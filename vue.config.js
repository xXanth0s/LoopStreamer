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
    target: 'electron-renderer',
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
  }),

  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/background/background.ts',
      mainProcessWatch: [
        'src/shared/**/*.ts',
        'src/store/**/*.ts',
        'src/background/**/*.ts',
        'src/browserMessages/**/*.ts',
      ],
    },
  },
};
