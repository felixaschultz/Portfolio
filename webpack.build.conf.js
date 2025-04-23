const { merge } = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const webpack = require('webpack');

const buildWebpackConfig = merge(baseWebpackConfig, {
  //!!!
  //CAUTION Production config
  //!!!
  mode: 'production',
  plugins: [
    
  ],
});

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig);
});