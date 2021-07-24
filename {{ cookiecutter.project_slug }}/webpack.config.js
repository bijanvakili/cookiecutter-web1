const _ = require("lodash");
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const packagesJson = require("./package.json");

const outputDirectory = path.join(__dirname, "dist");
const metaArtifactsDirectory = path.join(outputDirectory, "meta");
const vendorLibrariesDirectory = path.join(__dirname, "node_modules");

const vendorExclusions = [];
const vendorPackageNames = _.chain(packagesJson.dependencies)
  .keys()
  .difference(vendorExclusions)
  .value();

// Core configuration used in all modes.
const commonConfig = (env, argv) => {
  return {
    name: "app",
    entry: {
      app: ["./src/index.tsx"],
    },
    output: {
      path: outputDirectory,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                importLoaders: 1,
              },
            },
            "postcss-loader",
          ],
        },
        {
          test: /\.ts(x)?$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.json",
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/,
          use: "file-loader",
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".css"],
    },
  };
};

const configure = (env, argv) => {
  const config = commonConfig(env, argv);

  if (argv.mode === "development") {
    const defaultOutputOptions = {
      ...config.output,
      filename: "bundle-[name].js",
    };
    const defaultPlugins = [
      new MiniCssExtractPlugin({
        filename: "bundle-[name].css",
      }),
    ];

    return [
      {
        name: "vendor",
        entry: {
          vendor: vendorPackageNames,
          bootstrapcss: "bootstrap/dist/css/bootstrap.css",
        },
        module: {
          ...config.module,
        },
        output: {
          ...defaultOutputOptions,
          filename: "[name].dll.js",
          library: "[name]",
        },
        plugins: [
          ...defaultPlugins,
          new webpack.DllPlugin({
            context: __dirname,
            name: "[name]",
            path: path.join(metaArtifactsDirectory, "[name]-manifest.json"),
          }),
        ],
      },
      {
        ...config,
        devtool: "inline-source-map",
        entry: {
          ...config.entry,
          app: ["react-hot-loader/patch", ...config.entry.app],
        },
        output: {
          ...defaultOutputOptions,
        },
        plugins: [
          ...defaultPlugins,
          new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: path.join(metaArtifactsDirectory, "vendor-manifest.json"),
          }),
          new HtmlWebpackPlugin({
            inject: false,
            template: "./src/index.ejs",
          }),
          new AddAssetHtmlPlugin([
            {
              filepath: path.join(outputDirectory, "*.dll.js"),
              publicPath: "",
            },
            {
              filepath: path.join(outputDirectory, "*bootstrapcss.css"),
              typeOfAsset: "css",
              publicPath: "",
            },
          ]),
          new webpack.WatchIgnorePlugin({
            paths: [vendorLibrariesDirectory, outputDirectory],
          }),
        ],
        devServer: {
          contentBase: "./dist",
        },
        resolve: {
          ...config.resolve,
          alias: {
            "react-dom": "@hot-loader/react-dom",
          },
        },
      },
    ];
  } else {
    return {
      ...config,
      devtool: "source-map",
      entry: {
        ...config.entry,
        bootstrapcss: "bootstrap/dist/css/bootstrap.min.css",
      },
      output: {
        ...config.output,
        filename: "bundle-[name].js",
        chunkFilename: "[name].[id].css",
        clean: true,
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[name].[id].css",
        }),
        new HtmlWebpackPlugin({
          inject: false,
          template: "./src/index.ejs",
        }),
      ],
      optimization: {
        ...config.optimization,
        minimizer: [
          ...(_.get(config, "optimization.minimizer") || []),
          new CssMinimizerPlugin(),
        ],
      },
    };
  }
};

module.exports = configure;
