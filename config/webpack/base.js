import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin'; //eslint-disable-line

export default () => ({
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, '../..', 'assets'),
    filename: 'webpack-package.js',
    publicPath: '/assets',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['env', {
                modules: false,
                targets: {
                  browsers: '> 0%',
                  uglify: true,
                },
                useBuiltIns: true,
              }],
            ],
            plugins: [
              'syntax-dynamic-import',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body',
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '../..', 'assets'),
    historyApiFallback: true,
    inline: true,
    open: true,
  },
});
