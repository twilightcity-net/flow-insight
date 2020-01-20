const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const pkg = require("../../package");
const config = pkg.browserify;

// TODO we should lint the src view files
// TODO we should have a global lint functions for everything
module.exports = function() {
  return function() {
    var stream = browserify(config)
      .bundle()
      .pipe(source("build/electron.bundle.js"))
      .pipe(buffer())
      .pipe(gulp.dest("."));
    return stream;
  };
};
