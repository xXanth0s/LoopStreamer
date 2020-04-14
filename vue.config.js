// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  lintOnSave: false,
  filenameHashing: false,
  outputDir: `${__dirname}/dist_electron`,
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.ts',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Index Page',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },
    content: 'src/content/main.ts',
    // content: {
    //   entry: 'src/content/main.ts',
    //   target: 'electron-preload',
    // },
  },
  configureWebpack: () => ({
    devServer: {
      writeToDisk: true,
    },
    devtool: 'inline-source-map',
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [`${__dirname}/dist_electron/*.hot-update.*`],
        cleanAfterEveryBuildPatterns: [`${__dirname}/dist_electron/*.hot-update.*`],

        dry: false,
        dangerouslyAllowCleanPatternsOutsideProject: true,
      }),
    ],
  }),

  pluginOptions: {
    mainProcessWatch: ['src/content/main.ts'],
  },
};
