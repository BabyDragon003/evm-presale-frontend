module.exports = (config, context) => {
  return {
    ...config,
    node: {
      global: true,
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
            "source-map-loader"
          ],
        },
      ],
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};