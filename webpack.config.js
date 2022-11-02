const path = require("path");

module.exports = {
  //   watch: true,
  entry: "./src/app.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
