# Windows and views: detail

Click-through detail for 05-windows-views.mmd. Facts are as of commit `872b8ac1` (2025-03-03).

## WindowManagerHelper

There's one static helper per window, for example `createWindowConsole()` ([`public/managers/WindowManagerHelper.js:187-193`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManagerHelper.js?plain=1#L187-L193)). It's called from the loader, the activator and the window managers. For example, `MessageWindowManager` uses `createDMWindow` ([`public/managers/MessageWindowManager.js:54`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/MessageWindowManager.js?plain=1#L54)).

## WindowManager

`createWindow` reuses an existing window by name (focusing it and refreshing its URL), or builds a new one. A new window gets focus/blur handlers, is pushed onto `this.windows` (the list every event is broadcast to), and is loaded ([`public/managers/WindowManager.js:359-389`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L359-L389)).

## Window classes

Fourteen files in `public/windows/`. For example, `ConsoleWindow` is a frameless, transparent window that spans the full work area at half height. It has `nodeIntegration: true, contextIsolation: false` ([`public/windows/ConsoleWindow.js:24-58`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/windows/ConsoleWindow.js?plain=1#L24-L58)). That's why renderer code can `window.require("electron")` directly ([`src/events/RendererEventManager.js:1`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L1)).

## Dev mode?

`getWindowViewURL` picks between the two URLs based on `electron-is-dev` ([`public/managers/WindowManager.js:193-218`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L193-L218)).

## CRA dev server :3000

In dev the URL is `http://localhost:3000?view=<name>&…` ([`WindowManager.js:203-209`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L203-L209)). `yarn dev` runs `react-scripts start` and waits on port 3000 before launching Electron ([`package.json:32`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L32), [`:37`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L37)).

## build index.html

Packaged, the URL is `file://<appPath>/<rootDir>/index.html?view=<name>&…` ([`WindowManager.js:210-217`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L210-L217)).

## ViewManager

`ViewManager.View()` parses the query string. It passes every key except `view` and `render3d` as `routeProps` ([`src/views/ViewManager.js:38-47`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L38-L47), [`:92-97`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L92-L97)). It renders under a single `<Route path="/">` ([`ViewManager.js:115-123`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L115-L123)).

## View components

The views are `Loading`, `Activator`, `Console`, `Chart`, `Hotkey`, `OrgSwitch`, `Invitation`, `Moovie`, `Message`, `GettingStarted`, `Fervie`, `PluginRegistration`, `LoadModuleConfig` and `ActiveStatus` ([`src/views/ViewManager.js:7-20`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L7-L20)).

## Renderer clients

`ConsoleView` initializes eighteen client singletons, each bound to the console view's scope ([`src/views/ConsoleView.js:129-147`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ConsoleView.js?plain=1#L129-L147)). Other windows initialize the subset they need. The repo doesn't document which window uses which client.

## ConsoleLayout

`ConsoleView.render()` returns `<ConsoleLayout />` ([`src/views/ConsoleView.js:222-225`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ConsoleView.js?plain=1#L222-L225)). That renders `ConsoleSidebar` and `LayoutContent` ([`src/layout/ConsoleLayout.js:2-3`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/ConsoleLayout.js?plain=1#L2-L3)). Their subtrees are folders under `src/layout/console/content/` (circuit, journal, flow, terminal, dashboard and others) and `src/layout/console/sidebar/` (team, buddies, fervie, notifications and others).

## RendererControllerFactory

`getViewController(name, scope)` returns a cached controller per view name, creating it on first use ([`src/controllers/RendererControllerFactory.js:50-75`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/RendererControllerFactory.js?plain=1#L50-L75)). `ConsoleLayout` asks it for the sidebar controller ([`src/layout/ConsoleLayout.js:33-34`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/ConsoleLayout.js?plain=1#L33-L34)).

## Window and view name lists

The same names appear in three lists, plus a fourth switch:
- `WindowManagerHelper.WindowNames` ([`public/managers/WindowManagerHelper.js:19-36`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManagerHelper.js?plain=1#L19-L36));
- `ViewManagerHelper.ViewNames` ([`public/managers/ViewManagerHelper.js:10-27`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/ViewManagerHelper.js?plain=1#L10-L27));
- the renderer's `if`/`else if` chain on the upper-cased name ([`src/views/ViewManager.js:49-86`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L49-L86));
- the switch that maps a name to a window class, whose doc comment says "Need to add a new case for each window we wish to open" ([`public/managers/WindowManager.js:396-439`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L396-L439)).

## createWindow

See *WindowManager*.

## new by name

`getWindowInstanceFromName` switches on the class name. An unknown name returns `null` ([`WindowManager.js:402-439`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L402-L439)), and `createWindow` would then fail on `window.window`.

## getWindowViewURL

Each window class calls it in its constructor. `ConsoleWindow` does so with `ViewNames.CONSOLE` ([`public/windows/ConsoleWindow.js:26-30`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/windows/ConsoleWindow.js?plain=1#L26-L30)). `loadWindow` calls it again and does `loadURL`, then shows the window 500 ms after `ready-to-show` if `autoShow` is set ([`WindowManager.js:225-239`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L225-L239)).

## yes

Dev: the CRA server.

## no

Packaged: the built `index.html`.

## ?view=name

Extra args become `&key=value` pairs, without URL-encoding ([`WindowManager.js:194-201`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/WindowManager.js?plain=1#L194-L201)).

## if-chain on view

An unknown view name throws "Unable to render unknown view type" ([`src/views/ViewManager.js:80-85`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L80-L85)).

## init singletons

Each `XClient.init(scope)` creates the instance only once per renderer ([`src/clients/JournalClient.js:51-55`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L51-L55)).

## render

See *ConsoleLayout*.

## view controllers

See *RendererControllerFactory*.

## kept in sync by hand

This is dashed because adding a window means editing every list in *Window and view name lists*, plus a new `public/windows/*Window.js`, a new `src/views/*View.js` and a `WindowManagerHelper.create…` method. Nothing in the repo checks that they agree.
