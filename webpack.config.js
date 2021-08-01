let webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs-extra'),
  env = require('./utils/env'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin');

// const ASSET_PATH = process.env.ASSET_PATH || '/';

let alias = {
  'react-dom': '@hot-loader/react-dom',
};

// load the secrets
let secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

let fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

const options = {
  mode: process.env.NODE_ENV || 'development',
  chromeExtensionBoilerplate: {
    notHotReload: ['contentScript', 'devtools'],
  },
  entry: {
    options: path.join(__dirname, 'chrome', 'pages', 'Options', 'index.jsx'),
    popup: path.join(__dirname, 'chrome', 'pages', 'Popup', 'index.jsx'),
    background: path.join(__dirname, 'chrome', 'pages', 'Background', 'index.js'),
    content: path.join(__dirname, 'chrome', 'pages', 'Content', 'index.js'),
    // newtab: path.join(__dirname, 'chrome', 'pages', 'Newtab', 'index.jsx'),
    // devtools: path.join(__dirname, 'chrome', 'pages', 'Devtools', 'index.js'),
    // panel: path.join(__dirname, 'chrome', 'pages', 'Panel', 'index.jsx'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `chrome` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader',
        options: {
          // outputPath: 'images',
          // outputPath: (url, resourcePath, context) => {}
          name: '[path][name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      { test: /\.(ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions
      .map((extension) => '.' + extension)
      .concat(['.js', '.jsx', '.ts', '.tsx', '.css']),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: true,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'chrome/pages/Content/content.styles.css',
          to: path.join(__dirname, 'build'),
          force: true,
        },
        {
          from: 'public/**',
          to: path.join(__dirname, 'build/[path][name].[ext]'),
          force: true,
        },
        {
          from: "chrome/manifest.(dev|prod).json",
          to: path.join(__dirname, 'build', 'manifest.json'),
          force: true,
          filter: async (resourcePath) => {
            const nodeEnv = env.NODE_ENV === 'development' ? 'dev': 'prod';
            return resourcePath.indexOf(nodeEnv) !== -1;
          },
          transform: function (content, path) {
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'chrome', 'pages', 'Options', 'index.html'),
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'chrome', 'pages', 'Popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       from: 'public/img/icon-34.png',
    //       to: path.join(__dirname, 'build/public/img'),
    //       force: true,
    //     },
    //   ],
    // }),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, 'chrome', 'pages', 'Newtab', 'index.html'),
    //   filename: 'newtab.html',
    //   chunks: ['newtab'],
    //   cache: false,
    // }),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, 'chrome', 'pages', 'Devtools', 'index.html'),
    //   filename: 'devtools.html',
    //   chunks: ['devtools'],
    //   cache: false,
    // }),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, 'chrome', 'pages', 'Panel', 'index.html'),
    //   filename: 'panel.html',
    //   chunks: ['panel'],
    //   cache: false,
    // }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

module.exports = options;
