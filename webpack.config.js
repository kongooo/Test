const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        client: './frontend/ts/entry/client.ts',
        loading: './frontend/ts/entry/loading.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: './'
    },
    devtool: 'source-map',
    mode: 'development',
    devServer: {
        contentBase: './dist',
        writeToDisk: true,
        host: 'localhost'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Koa and xhr',
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [{
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    }
};