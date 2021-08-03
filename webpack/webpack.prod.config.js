let webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs-extra'),
  env = require('../utils/env'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  app_root_path = require('app-root-path').path;

// const ASSET_PATH = process.env.ASSET_PATH || '/';

let alias = {
  'react-dom': '@hot-loader/react-dom',
};

// load the secrets
let secretsPath = path.join(app_root_path, 'secrets.' + env.NODE_ENV + '.js');

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
  mode : 'production',
  optimization : {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  entry: {
    options: path.join(app_root_path, 'chrome', 'pages', 'Options', 'index.jsx'),
    popup: path.join(app_root_path, 'chrome', 'pages', 'Popup', 'index.jsx'),
    background: path.join(app_root_path, 'chrome', 'pages', 'Background', 'index.js'),
    content: path.join(app_root_path, 'chrome', 'pages', 'Content', 'index.js'),
    // newtab: path.join(__dirname, 'chrome', 'pages', 'Newtab', 'index.jsx'),
    // devtools: path.join(__dirname, 'chrome', 'pages', 'Devtools', 'index.js'),
    // panel: path.join(__dirname, 'chrome', 'pages', 'Panel', 'index.jsx'),
  },
  output: {
    path: path.resolve(app_root_path, 'build'),
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
          to: path.join(app_root_path, 'build'),
          force: true,
        },
        {
          from: 'public/**',
          to: path.join(app_root_path, 'build/[path][name].[ext]'),
          force: true,
        },
        {
          from: "chrome/manifest.prod.json",
          to: path.join(app_root_path, 'build', 'manifest.json'),
          force: true,
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
      template: path.join(app_root_path, 'chrome', 'pages', 'Options', 'index.html'),
      filename: 'options.html',
      chunks: ['options'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(app_root_path, 'chrome', 'pages', 'Popup', 'index.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      cache: false,
    }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
};


module.exports = options;
