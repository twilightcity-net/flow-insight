const gulp = require("gulp");
const clean = require("gulp-clean");

module.exports = function() {
  return function() {
    var stream = gulp
      .src(
        [
          "build/*.js",
          "build/app/*.js",
          "build/managers/*.js",
          "build/windows/*.js",
          "!build/assets/**/*",
          "!build/static/**/*",
          "!build/**/*.dat"
        ],
        { read: false }
      )
      .pipe(clean());
    return stream;
  };
};
