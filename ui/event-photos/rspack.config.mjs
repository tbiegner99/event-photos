import path from 'path';

import { defineConfig } from '@rspack/cli';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rspack from '@rspack/core';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default defineConfig((env) => ({
    devtool: env.MODE === 'development' ? 'inline-source-map' : 'source-map',
    mode: env.MODE || 'production',
    entry: './src/app.tsx',
    output: {
        filename: 'event-photos-app.js', // '[name].[contenthash].bundle.js',

        path: path.resolve(__dirname, 'build', process.env.OUTDIR || ''),
        publicPath: process.env.BASE_PATH
    },
    // externals: ['react', 'react-dom'],
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
    },

    plugins: [
        new rspack.HtmlRspackPlugin({
            template: path.join(__dirname, 'html', 'template.ejs.html')
        }),
        new rspack.EnvironmentPlugin({
            NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
            IMAGE_BUCKET_URL: 'https://storage.googleapis.com/event-photos.tjbiegner.com',
            DEBUG: false
        })
    ],
    devServer: {
        // hot: true,
        allowedHosts: 'all',
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        },
        host: '0.0.0.0',
        port: '8000',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        },

        historyApiFallback: true
    },

    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: {
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'ecmascript',
                                jsx: true
                            }
                        }
                    }
                },
                type: 'javascript/auto'
            },
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'builtin:swc-loader',
                    options: {
                        jsc: {
                            parser: {
                                syntax: 'typescript',
                                tsx: true
                            }
                        }
                    }
                },
                type: 'javascript/auto'
            },
            {
                test: /\.svg$/,
                exclude: /node_modules/,
                issuer: /\.[jt]sx?$/,
                use: ['@svgr/webpack']
            },
            {
                test: /\.(png|jpe?g|gif|eot|woff2?|ttf)$/i,
                type: 'asset'
            },
            {
                test: /\.html?$/i,
                use: ['html-loader']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                namedExport: false,
                                localIdentName: '[path][name]__[local]'
                            }
                        }
                    }
                ]
            }
        ]
    }
}));
