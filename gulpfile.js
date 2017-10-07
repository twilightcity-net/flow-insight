var gulp = require("gulp");

function getTask(name) {
  return require("./gulp/tasks/" + name)();
}

gulp.task("prettier", getTask("prettier"));
gulp.task("lint", getTask("lint"));
gulp.task("bundle", getTask("bundle"));

gulp.task("default");
