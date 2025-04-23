const { merge } = require('webpack-merge');
const common = require('./webpack.confg.js');

module.exports = merge(common, {
    plugins: [
        new HtmlWebpackPlugin({
            template: "production.html"
        })
    ],
    mode: 'production',
});