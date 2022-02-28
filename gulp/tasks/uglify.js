const gulp = require("gulp");
const rename = require("gulp-rename");
const terser = require("terser");
const gulpTerser = require("gulp-terser");
const pkg = require("../../package");
const config = pkg.uglify;

module.exports = function () {
  return function () {
    var stream = gulp
      .src("build/electron.bundle.js")
      .pipe(gulpTerser({}, terser.minify))
      .pipe(rename("net.twilightcity.flowinsight.dat"))
      .pipe(gulp.dest("build"));
    return stream;
  };
};
