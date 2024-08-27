const webpack = require('webpack');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve.alias = {
                ...(webpackConfig.resolve.alias || {}),
                fs: require.resolve('./src/utils/fs-browser.js'),  
            };

            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                path: require.resolve('path-browserify'),
                buffer: require.resolve('buffer'),
                fs: false,  
            };

            webpackConfig.plugins = (webpackConfig.plugins || []).concat([
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                    process: 'process/browser.js',
                }),
            ]);

            return webpackConfig;
        },
    },
};
