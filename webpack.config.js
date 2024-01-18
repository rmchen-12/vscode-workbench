const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const getPlugins = (isDEV) => {
  if (isDEV)
    return [
      new HtmlWebPackPlugin({
        //该插件将html 也打包编译
        template: __dirname + '/index.html',
        filename: __dirname + '/dist/index.html',
        inject: 'body',
        hash: true,
      }),
      new webpack.HotModuleReplacementPlugin(),
    ];

  return [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      //该插件将html 也打包编译
      template: __dirname + '/src/index.html',
      filename: __dirname + '/dist/index.html',
      inject: 'body',
      hash: true,
    }),
  ];
};

module.exports = (env) => {
  // console.log('NODE_ENV: ', env.NODE_ENV);
  const isDEV = env.NODE_ENV === 'development';
  const isProduction = !isDEV;

  const cssHotLoader = ['style-loader'];

  return {
    mode: isDEV ? 'development' : 'production',
    devtool: isDEV ? 'source-map' : '',
    devServer: {
      contentBase: './dist',
      hot: true,
    },
    entry: './src/main.ts',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [...cssHotLoader, 'css-loader'],
        },
        {
          test: /\.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  noEmit: false, // this option will solve the issue
                },
              },
            },
          ],
        },
      ],
    },
    plugins: getPlugins(isDEV),
    resolve: {
      extensions: ['.js', '.vue', '.json', '.ts', '.tsx'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': resolve('src'),
        src: resolve('src'),
        base: resolve('src/base'),
        platform: resolve('src/platform'),
      },
    },
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, 'dist'),
    },
  };
};
