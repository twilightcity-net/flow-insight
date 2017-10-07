const gulp = require("gulp");
const pkg = require("../../package");
const config = pkg.prettierConfig;
const prettier = require("gulp-prettier");

module.exports = function() {
  return function() {
    // var stream = gulp
    //   .src([ "./gulp/**/*.js" ])
    //   .pipe(prettier(config))
    //   .pipe(gulp.dest("./gulp"));

    // stream += gulp
    //   .src([
    //     "./public/**/*.js",
    //     "./public/**/*.json",
    //     "!./public/assets/**/*"
    //   ])
    //   .pipe(prettier(config))
    //   .pipe(gulp.dest("./public"));

    // stream += gulp
    //   .src([ "./src/**/*.js", "./src/**/*.json"])
    //   .pipe(prettier(config))
    //   .pipe(gulp.dest("./src"));

    //   stream += gulp
    //   .src([ "./gulpfile.js" ])
    //   .pipe(prettier(config))
    //   .pipe(gulp.dest("./"));

    // return stream;
    return null;
  };
};
