const webpack = require('webpack')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            webpackConfig.resolve.alias = {
                ...(webpackConfig.resolve.alias || {}),

        fs: false,
        'node:fs': false,

                'node:buffer': require.resolve('buffer'),
                'node:crypto': require.resolve('crypto-browserify'),
                'node:stream': require.resolve('stream-browserify'),
                'node:path': require.resolve('path-browserify'),
                'node:url': require.resolve('url/'),
                'node:string_decoder': require.resolve('string_decoder/'),
                'node:vm': require.resolve('vm-browserify'),

        // ⬇️ Make the subpath explicit for ESM “fully specified” imports
        'semver/preload$': require.resolve('semver/preload.js'),
            }

            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                path: require.resolve('path-browserify'),
                buffer: require.resolve('buffer'),
                vm: require.resolve('vm-browserify'),
                url: require.resolve('url/'),
                string_decoder: require.resolve('string_decoder/'),
                fs: false,
            }

      // Allow extensionless ESM like "semver/preload"
      webpackConfig.module.rules.push(
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
        },
        {
          test: /\.cjs$/,
          type: 'javascript/auto',
        },
      )

      // keep your existing plugins; include the node: scheme stripper if you added it
            webpackConfig.plugins = (webpackConfig.plugins || []).concat([
                new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
                    resource.request = resource.request.replace(/^node:/, '')
                }),

                new NodePolyfillPlugin({excludeAliases: ['console']}),
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                    process: 'process/browser.js',
                }),
            ]);

            return webpackConfig;
        },
    },
};
