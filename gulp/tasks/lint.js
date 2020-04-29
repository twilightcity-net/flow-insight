const gulp = require("gulp");
const pkg = require("../../package");
const config = pkg.jshint;
const jshint = require("gulp-jshint");
const stylish = require("jshint-stylish");

// TODO we should lint the src view files
// TODO we should have a global lint functions for everything
module.exports = function() {
  return function() {
    var stream = gulp
      .src([
        "./public/*.js",
        "!./public/assets/**/*",
        "./gulp/**/*.js"
      ])
      .pipe(jshint(config))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter("fail"));
    return stream;
  };
};
