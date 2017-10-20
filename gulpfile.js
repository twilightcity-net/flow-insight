var gulp = require("gulp");

function getTask(name) {
  return require("./gulp/tasks/" + name)();
}

gulp.task("prettier", getTask("prettier"));
gulp.task("lint", getTask("lint"));
gulp.task("browserify", getTask("browserify"));
gulp.task("uglify", getTask("uglify"));
gulp.task("clean", getTask("clean"));

gulp.task("default");