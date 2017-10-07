const gulp = require("gulp");
const clean = require("gulp-clean");

module.exports = function() {
  return function() {
    var stream = gulp
      .src(
        [
          "build/*.js",
          "!build/assets/**/*",
          "!build/static/**/*",
          "!build/**/*.min.js"
        ],
        { read: false }
      )
      .pipe(clean());
    return stream;
  };
};
