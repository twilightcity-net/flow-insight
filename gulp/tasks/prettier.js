const gulp = require("gulp");
const pkg = require("../../package");
const configJS = pkg.prettier.configJS;
const configJSON = pkg.prettier.configJSON;
const prettier = require("gulp-prettier-plugin");

module.exports = function() {
  return function() {
    var stream = gulp
      .src([
        "./gulp/**/*.js",
        "./public/**/*.js",
        "!./public/assets/**/*",
        "./src/**/*.js",
        "./server/**/*.js",
        "./gulpfile.js"
      ])
      .pipe(prettier(configJS))
      // passing a function that returns base will write the files in-place
      .pipe(gulp.dest(file => file.base));
    stream += gulp
      .src(["./package.json"])
      .pipe(prettier(configJSON))
      .pipe(gulp.dest(file => file.base));
    return stream;
  };
};
