const gulp = require("gulp");
const taskPretty = require("./gulp/tasks/pretty");
const taskPrettier = require("./gulp/tasks/prettier");
const taskLint = require("./gulp/tasks/lint");
const taskBrowserify = require("./gulp/tasks/browserify");
const taskUglify = require("./gulp/tasks/uglify");
const taskClean = require("./gulp/tasks/clean");

const OsTypeToTargetMap = {
  Darwin: {
    distDir: "./dist/mac/resources",
    releaseAsarFile: "dist/mac/Torchie.app/Contents/Resources/app.asar"
  },
  Linux: {
    distDir: "./dist/win-unpacked/resources",
    releaseAsarFile: `${this.distDir}/app.asar`
  },
  Windows_NT: {
    distDir: "./dist/win-unpacked/resources",
    releaseAsarFile: "dist/???/app.asar"
  }
};

function getTask(name) {
  return require("./gulp/tasks/" + name);
}

gulp.task("pretty", taskPretty());
gulp.task("prettier", taskPrettier());
gulp.task("lint", taskLint());
gulp.task("browserify", taskBrowserify());
gulp.task("uglify", taskUglify());
gulp.task("clean", taskClean());

gulp.task("releaseBuildUpdate", function(cb) {
  const fs = require("fs-extra");
  const gutil = require("gulp-util");
  const execSync = require("child_process").execSync;

  const osType = require("os").type();
  if (osType === "Linux") {
    console.log(`Linux build not yet supported.  Exiting...`);
    return gutil.noop();
  }
  const target = OsTypeToTargetMap[osType];
  const distDir = target.distDir;
  const distResourcesDir = `${distDir}/resources`;
  const asarBin = "node_modules/.bin/asar";
  const asar = "app.asar";
  const releaseAsarFile = target.releaseAsarFile;
  const asarDir = `${distResourcesDir}/${asar}`;
  const asarExtracted = "${asar}.extracted";
  const asarExtractedDir = `${distResourcesDir}/${asarExtracted}`;
  const buildDir = "./build";
  const copyBuildDir = `${asarExtractedDir}/build`;

  const processAsar = () => {
    if (fs.existsSync(releaseAsarFile)) {
      console.log(`Extracting ${asar}...`);
      execSync(
        `${asarBin} extract ${releaseAsarFile} ${asarExtractedDir}`,
        function(err, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);
          cb(err);
        }
      );
      copyBuild();
    } else {
      console.log(`Project not distributed: Try 'yarn release' first.`);
    }
  };
  const packAsar = () => {
    console.log(`Packing ${asar}...`);
    execSync(`${asarBin} pack ${asarExtractedDir} ${asarDir}`, function(
      err,
      stdout,
      stderr
    ) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  };
  const copyBuild = () => {
    console.log("Removing build dir...");
    fs.removeSync(`${copyBuildDir}`);
    console.log("Copying build dir...");
    fs.copySync(`${buildDir}`, `${asarExtractedDir}`);
    packAsar();
  };

  console.log("Updating Project Distribution Sources...");
  if (fs.existsSync(asarExtractedDir)) {
    copyBuild();
    packAsar();
  } else {
    processAsar();
  }

  return gutil.noop();
});

gulp.task("default");
