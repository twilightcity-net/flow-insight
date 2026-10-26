# Startup lifecycle: detail

Click-through detail for 03-startup.mmd. Facts are as of commit `872b8ac1` (2025-03-03).

## electron.js

The whole file is `global.App = new App()` inside a try/catch ([`public/electron.js:1-11`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/electron.js?plain=1#L1-L11)). It's the `main` entry in `package.json` ([`package.json:16`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L16)). Release builds override `main` with the bundled `.dat` file (see *Build and release*).

## App constructor

In order, the constructor:
- prints a banner and sets a dev user-data dir in dev ([`public/app/App.js:82-85`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L82-L85));
- takes the single-instance lock ([`App.js:98-104`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L98-L104));
- applies two "SECURITY PATCH" workarounds ([`App.js:113-131`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L113-L131));
- calls `start()`, which registers `ready`, `window-all-closed`, `quit`, `will-quit` and `gpu-process-crashed` handlers ([`App.js:358-370`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L358-L370)).

## onReady builds managers

`onReady` copies the API name and URLs from `AppConfig` onto `global.App` ([`App.js:154-161`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L154-L161)). It then constructs every manager, job and helper as a `global.App.*` singleton and calls `load()` ([`App.js:173-216`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L173-L216)). Construction order matters, because managers construct their controllers, which register IPC listeners. For example, `JournalManager` creates `JournalController` and calls `configureEvents()` ([`public/managers/JournalManager.js:10-14`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/JournalManager.js?plain=1#L10-L14)).

In production, a CSP header `script-src 'self'` is added; the comment says "in prod mode, this disallows opening the dev tools" ([`App.js:229-246`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L229-L246)).

## Settings valid?

`load()` branches on `AppSettings.check()` ([`App.js:375-384`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L375-L384)). `check()` returns true only if `~/.flow/settings.json` exists and `verify()` passes ([`public/app/AppSettings.js:57-67`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L57-L67)).

## Activator window

`AppActivator.start()` opens the activator window ([`public/app/AppActivator.js:64-68`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppActivator.js?plain=1#L64-L68)). The view `POST`s the code to `/account/activate` through a renderer `DataStore` ([`src/stores/AccountActivationStore.js:7-14`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/stores/AccountActivationStore.js?plain=1#L7-L14)). It then sends the result back on `APPACTIVATOR_SAVE_ACTIVATION`, and `AppActivator` saves the API key ([`AppActivator.js:41-59`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppActivator.js?plain=1#L41-L59)).

## Loading window

`AppLoader.load()` creates the tray, the loading window and the menu ([`public/app/AppLoader.js:116-121`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L116-L121)). The stages are `login`, `talk`, `volumes`, `console`, `shortcuts` and `finished` ([`AppLoader.js:324-333`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L324-L333)). A single `APPLOADER_LOAD` handler switches on the stage name ([`AppLoader.js:292-318`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L292-L318)). Each transition waits `eventTimerMs` (210 ms) ([`AppLoader.js:32`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L32)). The source calls this wiring "a really rough mimic of the front end circuit for listeners" ([`AppLoader.js:38-41`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L38-L41)).

## Login stage

`processLogin` calls `AppLogin.doLogin` ([`AppLoader.js:366-389`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L366-L389)). That posts to `/account/login` with `appName` and `version`, or to `/account/login/to/organization/<id>` when a primary org is saved ([`public/app/AppLogin.js:16-42`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLogin.js?plain=1#L16-L42)).

## Talknet stage

`connectToTalknet` calls `TalkManager.createConnection()` ([`AppLoader.js:394-401`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L394-L401)). On socket `connect`, `TalkController` rejoins rooms and dispatches `TALK_CONNECTED` ([`public/controllers/TalkController.js:178-189`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L178-L189)).

## Volumes stage

`initVolumes` calls `VolumeManager.init()` ([`AppLoader.js:431-438`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L431-L438)). That creates 11 database volumes and then asks seven managers to load defaults ([`public/managers/VolumeManager.js:35-79`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L35-L79)). See *Data and state*.

## Console stage

`createConsole` calls `WindowManagerHelper.createWindowConsole()` ([`AppLoader.js:406-413`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L406-L413)).

## Shortcuts stage

`createShortcuts` calls `ShortcutManager.initGlobalShortcuts()` and then dispatches `SHORTCUTS_CREATED` ([`AppLoader.js:418-426`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L418-L426)).

## Finished

The window closes only when **both** the `finished` stage and the renderer's `APP_INTRO_DONE` have arrived. The delay factor is 4.2 or 1, depending on which came first ([`AppLoader.js:223-235`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L223-L235)).

## Windows and jobs start

`setTimeoutToCloseWindowAndStartHeartbeat` closes the loading window and unwires the loader's events. It opens the getting-started, Fervie and active-status windows, then starts `AppHeartbeat`, `AppFlowPublisherJob`, `AppFervieHelpJob` and global shortcuts ([`AppLoader.js:237-255`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L237-L255)).

## new App

See *electron.js*.

## app ready

Electron's `ready` event is bound to `onReady` in `start()` ([`App.js:362`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L362)).

## no key

`AppActivator.start()` and `createMenu()` ([`App.js:380-383`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L380-L383)).

## key found

The stored API key is decrypted into `global.App.ApiKey`, and `AppLoader.load()` runs ([`App.js:377-379`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L377-L379)).

## key entered, restart

This is dashed because a person has to enter a code. When the activator window closes with a non-error result, it calls `global.App.restart()` ([`public/windows/ActivatorWindow.js:74-81`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/windows/ActivatorWindow.js?plain=1#L74-L81)). `restart()` calls `app.relaunch()` only when **not** in dev. Then it calls `app.exit(0)` ([`App.js:390-393`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L390-L393)). So from source, the app quits after activation and has to be started again by hand.

## loading shown

`WINDOW_LOADING_SHOWN` starts the `login` stage ([`AppLoader.js:128-138`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L128-L138)).

## login valid

On a valid `ConnectionStatusDto`, it sets `isOnline`/`isLoggedIn`, keeps the status, and dispatches `WINDOW_LOADING_LOGIN` ([`AppLoader.js:370-380`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L370-L380)). That moves to `talk` ([`AppLoader.js:145-155`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L145-L155)). On failure it dispatches `WINDOW_LOADING_LOGIN_FAILED` ([`AppLoader.js:381-387`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L381-L387)), and `LoadingView` hides the progress bar and shows the message ([`src/views/LoadingView.js:99-114`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/LoadingView.js?plain=1#L99-L114)). There's no retry path in the loader.

## talk connected

`TALK_CONNECTED` moves to `volumes` ([`AppLoader.js:162-172`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L162-L172)). The loader also wires `TALK_CONNECT_FAILED` ([`AppLoader.js:64-67`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L64-L67)), but gives it no callback.

## volumes ready

`DATABASE_VOLUMES_READY` moves to `console` ([`AppLoader.js:174-184`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L174-L184)). `VolumeManager` dispatches it from a counter:
- `initializedVolumes` starts at 1 and the threshold `maxVolumes` is 7 ([`VolumeManager.js:26-27`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L26-L27), [`:37`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L37)).
- **Eight** init callbacks feed it, because circuit loading counts twice ([`VolumeManager.js:105-171`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L105-L171)).
- The `>=` test means the event can fire up to three times ([`VolumeManager.js:176-186`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L176-L186)).

The repo doesn't say whether that's intended, or whether later firings are harmless.

## console ready

`WINDOW_CONSOLE_READY` moves to `shortcuts` ([`AppLoader.js:191-201`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L191-L201)).

## shortcuts created

This moves to `finished`, with double the delay ([`AppLoader.js:208-218`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L208-L218)).

## intro done

`APP_INTRO_DONE` sets `introDone` and, if loading has also finished, closes the window and starts the jobs ([`AppLoader.js:230-235`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L230-L235)).
