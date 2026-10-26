# Build and release: detail

Click-through detail for 07-build-release.mmd. Facts are as of commit `872b8ac1` (2025-03-03).

## Developer

There's no `.github/` directory and no other CI config at this commit, so a person runs the release. `yarn dist` is the same chain with `--publish=never` ([`package.json:52`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L52)). The README lists Node v16.13.0 and Yarn 1.22 ([`README.md:22-25`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/README.md?plain=1#L22-L25)), and `package.json` pins `"node": "16.13.0"` ([`package.json:6-8`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L6-L8)).

## yarn release

`electron-builder -c.extraMetadata.main=build/net.twilightcity.flowinsight.dat --publish=always` ([`package.json:53`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L53)).

## yarn bundle

`gulp browserify && gulp uglify` ([`package.json:48`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L48)).

## yarn build

`react-scripts build` ([`package.json:45`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L45)). Its `postbuild` runs `yarn docs`, which writes JSDoc from `public/electron.js` ([`package.json:39`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L39), [`:46`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L46)). The tracked `docs/` folder (295 files) is that generated output.

## gulp prettier lint pretty

These are registered in `gulpfile.js` from `gulp/tasks/` ([`gulpfile.js:1-34`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulpfile.js?plain=1#L1-L34)). They also run on `yarn prestage` before `yarn stage`, which is `git add .` ([`package.json:30-31`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L30-L31)).

## react-scripts build

`react-scripts` ^3.4.4 with React 17.0.2 ([`package.json:81`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L81), [`:124`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L124)). Electron is ^17.4.0 ([`package.json:104`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L104)).

## build folder

Create React App copies `public/` into `build/` as it compiles. That's CRA's behavior; the repo doesn't say so. The rest of the chain depends on it: browserify's entry is `build/electron.js` ([`package.json:167-175`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L167-L175)).

## gulp browserify

It bundles with the `package.json` `browserify` config, including `"bundleExternal": false`, so `node_modules` stay unbundled. The output is `build/electron.bundle.js` ([`gulp/tasks/browserify.js:10-18`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulp/tasks/browserify.js?plain=1#L10-L18)).

## gulp uglify

Terser minifies `build/electron.bundle.js` and renames it `net.twilightcity.flowinsight.dat` ([`gulp/tasks/uglify.js:8-17`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulp/tasks/uglify.js?plain=1#L8-L17)).

## flowinsight.dat

The minified main process. Its name keeps the FlowInsight brand, while `appId` is `net.twilightcity.flowjournal` ([`package.json:218`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L218)).

## gulp clean

It removes `build/*.js`, `build/app/*.js`, `build/managers/*.js` and `build/windows/*.js`, but keeps assets, static and `.dat` ([`gulp/tasks/clean.js:6-19`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulp/tasks/clean.js?plain=1#L6-L19)). It doesn't list `build/controllers`, `build/database`, `build/events`, `build/job` or `build/dto`, so those unbundled copies probably ship too. The repo doesn't say whether that's intended.

## electron-builder

It packages `build/**/*` and `package.json`, with NSIS on Windows and a DMG layout on Mac ([`package.json:217-252`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L217-L252)).

## GitHub release

The publish target is `"provider": "github"` ([`package.json:253-255`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L253-L255)). Without an explicit owner or repo, electron-builder falls back to `repository`. That's electron-builder's own behavior, not stated in this repo. Here `repository` is `twilightcity-net/flowinsight-release`, not this repo ([`package.json:17-20`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L17-L20)).

## runs by hand

See *Developer*.

## prerelease

`"prerelease": "yarn bundle"` ([`package.json:51`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L51)).

## prebundle

`"prebundle": "yarn build"` ([`package.json:47`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L47)).

## prebuild

`"prebuild": "gulp prettier lint pretty"` ([`package.json:44`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L44)). Formatting rewrites sources as part of every build.

## then

After `prebuild`, yarn runs the `build` script itself.

## compiles src, copies public

See *build folder*.

## electron.js entry

`"entries": "build/electron.js"` ([`package.json:168`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L168)).

## electron.bundle.js

See *gulp browserify*.

## minify and rename

See *gulp uglify*.

## postbundle

`"postbundle": "gulp clean"` ([`package.json:49`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L49)).

## main override

`-c.extraMetadata.main=build/net.twilightcity.flowinsight.dat` replaces the dev `main` (`public/electron.js`) in the packaged `package.json` ([`package.json:16`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L16), [`:53`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L53)).

## publish always

`--publish=always` ([`package.json:53`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L53)). `gulp releaseBuildUpdate` is a separate path that patches an existing `app.asar` ([`gulpfile.js:9-23`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulpfile.js?plain=1#L9-L23), [`:36`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulpfile.js?plain=1#L36)). Its Windows target is literally `"dist/???/app.asar"` ([`gulpfile.js:21`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/gulpfile.js?plain=1#L21)).
