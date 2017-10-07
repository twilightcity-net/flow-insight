const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

// TODO we should lint the src view files
// TODO we should have a global lint functions for everything
module.exports = function() {
  return function() {
    var stream = browserify({
      entries: "build/electron.js",
      builtins: false,
      browserField: false,
      commondir: true,
      ignoreMissing: true,
      insertGlobalVars: "global",
      bundleExternal: false
    })
      .bundle()
      .pipe(source("build/electron.bundle.js"))
      .pipe(buffer())
      .pipe(gulp.dest("."));
    return stream;
  };
};
