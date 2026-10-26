# Three apps, one codebase: detail

Click-through detail for 02-app-variants.mmd. Facts are as of commit `872b8ac1` (2025-03-03).

This repo builds three apps: **FlowInsight**, **FlowJournal** and **WatchMoovies**. They're variants of a single codebase, each with a different set of features. At this commit the build is FlowJournal ([`public/app/AppConfig.js:5`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L5)).

## Developer

The variant is chosen at build time, in source. The repo has no build flag, environment variable or script that selects it. The latest commit, "Increment app version and set default config to FlowJournal app", is a variant switch: it edits `public/app/AppConfig.js`, `src/layout/shared/FeatureToggle.js` and `package.json` together. The commit before it, `7ba3add1`, says it will "make flow journal the default". Both commits come from `git log` at this SHA.

## AppConfig.appType

The main-process choice: `static appType = AppConfig.AppType.FLOW_JOURNAL` ([`public/app/AppConfig.js:5`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L5)). The three values are `FlowInsight`, `WatchMoovies` and `FlowJournal` ([`AppConfig.js:101-107`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L101-L107)). `appName` is set from it, so it also becomes Electron's app name ([`AppConfig.js:9`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L9), [`public/app/App.js:156-161`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L156-L161)). Tests: `isFlowInsightApp`, `isFlowJournalApp` and `isMoovieApp` ([`AppConfig.js:55-73`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L55-L73)).

## FeatureToggle.appType

The renderer can't read `AppConfig`, so it keeps its own copy: `static appType = FeatureToggle.AppType.FLOW_JOURNAL` ([`src/layout/shared/FeatureToggle.js:6-8`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/shared/FeatureToggle.js?plain=1#L6-L8)). The file says so itself: "this appType logic is duplicated on the backend within AppConfig, these props should exist on the backend, and be handed to the frontend so they're in one place" ([`FeatureToggle.js:3-4`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/shared/FeatureToggle.js?plain=1#L3-L4)). The version string is duplicated too, in `AppConfig.js:10` and `FeatureToggle.js:8`.

## package.json identity

`name` `flow-journal`, `productName` `FlowJournal` and its `description` ([`package.json:2-5`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L2-L5)), plus `build.appId` `net.twilightcity.flowjournal` ([`package.json:218`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L218)). The previous FlowInsight values were `flow-insight`, `FlowInsight` and `net.twilightcity.flowinsight` (from the `872b8ac1` diff). Some FlowInsight branding doesn't change with the variant: the bundled main file is still `net.twilightcity.flowinsight.dat` ([`package.json:53`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L53)).

## Main-process branches

Examples where the main process behaves differently per variant:
- **App menu:** the feature submenu differs per app. FlowJournal offers only "Focus Bar" ([`public/app/MenuHandler.js:13-35`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/MenuHandler.js?plain=1#L13-L35)). FlowInsight offers ten toggles, including Journal, Flow Metrics, Flow Dashboard, Trouble Control and Neo Mode ([`MenuHandler.js:36-120`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/MenuHandler.js?plain=1#L36-L120)). WatchMoovies gets none. The help menu also links watchmoovies.com or flowinsight.com ([`MenuHandler.js:150-170`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/MenuHandler.js?plain=1#L150-L170)).
- **Tray:** WatchMoovies gets its own tray icon ([`public/app/AppTray.js:16-30`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppTray.js?plain=1#L16-L30)).
- **Background jobs:** in WatchMoovies the flow publisher never starts ([`public/app/AppFlowPublisherJob.js:42-45`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppFlowPublisherJob.js?plain=1#L42-L45)), and neither does the Fervie help job ([`public/app/AppFervieHelpJob.js:35`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppFervieHelpJob.js?plain=1#L35)).
- **Momentum:** "in the flow journal app, we get momentum credit just for entering intentions" ([`public/job/FlowStateTracker.js:134-138`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/job/FlowStateTracker.js?plain=1#L134-L138)).
- **Settings:** WatchMoovies stores its primary org under a separate settings key ([`public/app/AppSettings.js:346-370`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L346-L370)).
- **Fervie popup:** only FlowInsight can enable it ([`AppConfig.js:63-65`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L63-L65)).

## Renderer branches

Examples in the React code:
- **Intro video:** a different one per app ([`src/views/LoadingView.js:173-180`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/LoadingView.js?plain=1#L173-L180)).
- **Default sidebar panel:** WatchMoovies opens on Buddies ([`src/layout/console/sidebar/ConsoleSidebar.js:180-186`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L180-L186)).
- **Sidebar items:** Circuits and metrics appear only in FlowInsight ([`ConsoleSidebar.js:657`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L657), [`:731`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L731), [`:748`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L748)). Some items are shared by FlowInsight and FlowJournal ([`ConsoleSidebar.js:624`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L624)).

About fifty call sites across 22 files check the app type. The repo doesn't have a list of which features belong to which app.

## Feature toggle list

User-facing toggles sit on top of the variant. They're a comma list in `~/.flow/settings.json`. When the list is absent, the defaults are metrics, status, dashboard, control, journal, individual and fervie ([`public/app/AppSettings.js:143-162`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L143-L162)). The defaults are the same for all three variants, so the variant decides which toggles are reachable (see the app menu above). Flipping one from the menu calls `FeatureToggleManager.toggleFeature` ([`MenuHandler.js:121-124`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/MenuHandler.js?plain=1#L121-L124)).

## Login request

Login posts `?appName=<variant>&version=…` ([`public/app/AppLogin.js:18`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLogin.js?plain=1#L18)), so the server knows which app is connecting. The repo doesn't say what the server does differently.

## Installer

electron-builder takes the product name and app id from `package.json`. The Windows installer is named `${productName}-Setup-${version}` ([`package.json:246-252`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L246-L252)). See the *Build and release* diagram.

## edit by hand

These are dashed because nothing ties the three edits together. A build where `AppConfig.appType` and `FeatureToggle.appType` disagree would compile and run, with the main process acting as one app and the UI as another. Nothing in the repo checks for that. Commit `872b8ac1` shows the full set of files to change.

## isFlowInsightApp/isFlowJournalApp/isMoovieApp

The main process's three tests, one per app: `isFlowInsightApp()`, `isFlowJournalApp()` and `isMoovieApp()`. Each compares `AppConfig.appType` with one `AppType` value ([`public/app/AppConfig.js:55-73`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L55-L73)). There's also `isFerviePopupEnabled()`, which combines `isFlowInsightApp()` with the fervie toggle ([`AppConfig.js:63-65`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L63-L65)). The examples under *Main-process branches* all use these.

## isFlowInsightApp/isJournalApp/isMoovieApp/isFlowInsightOrJournalApp

The renderer's tests are `isMoovieApp`, `isJournalApp`, `isFlowInsightApp` and `isFlowInsightOrJournalApp` ([`src/layout/shared/FeatureToggle.js:53-68`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/shared/FeatureToggle.js?plain=1#L53-L68)). Note the different naming: `isJournalApp` in the renderer, `isFlowJournalApp` in the main process.

## AppConfig.init

`FeatureController.init()` loads the toggles from settings and calls `AppConfig.init` ([`public/controllers/FeatureController.js:41-44`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/FeatureController.js?plain=1#L41-L44)). It calls it again whenever a toggle is turned on or off, and then notifies the renderers ([`FeatureController.js:214-250`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/FeatureController.js?plain=1#L214-L250)). `AppConfig.init` sets every known toggle to false, then sets the listed ones to true ([`AppConfig.js:109-121`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L109-L121)).

## FeatureToggle.init

`FeatureClient` asks main for the list over IPC and calls `FeatureToggle.init(arg.data)`. It does this at start, on a visible refresh, and on a silent refresh ([`src/clients/FeatureClient.js:62-85`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/FeatureClient.js?plain=1#L62-L85)). Main answers with its current list ([`FeatureController.js:197-205`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/FeatureController.js?plain=1#L197-L205)). The init logic itself is duplicated from `AppConfig.init` ([`FeatureToggle.js:95-106`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/shared/FeatureToggle.js?plain=1#L95-L106)).

## appName parameter

See *Login request*.

## productName and appId

See *package.json identity* and *Installer*.
