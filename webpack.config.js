const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
	entry: "./src/index.ts",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
		alias: {
			vue$: "vue/dist/vue.esm.js" // 'vue/dist/vue.common.js' for webpack 1
		}
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist")
	},
	plugins: [
		new CopyPlugin([{ from: "./src/assets", to: "assets" }]),
		new HtmlWebpackPlugin({
			title: "My card game",
			template: "src/index.html"
		})
	]
}
