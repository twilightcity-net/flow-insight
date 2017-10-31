const gulp = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const pkg = require("../../package");
const config = pkg.uglify;

module.exports = function() {
  return function() {
    var stream = gulp
      .src("build/electron.bundle.js")
      .pipe(uglify(config))
      .pipe(rename("io.dreamscale.metaos.dat"))
      .pipe(gulp.dest("build"));
    return stream;
  };
};
