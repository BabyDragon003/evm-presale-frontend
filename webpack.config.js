module.exports = (config, context) => {
  return {
    ...config,
    node: {
      global: true,
          use: [
            "style-loader",
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                // Prefer `dart-sass`
                implementation: require("sass"),
              },
            },
            "source-map-loader"
          ],
        },
      ],
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};