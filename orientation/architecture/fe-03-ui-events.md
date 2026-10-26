# UI events take the long way: detail

Click-through detail for fe-03-ui-events.mmd. Facts are as of commit `872b8ac1` (2025-03-03). In the front end, components coordinate by **events on named channels**, not by shared React state or context. `RendererEvent.dispatch(arg, noEcho, isSync)` echoes by default ([`src/events/RendererEventManager.js:65-72`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L65-L72)), so a UI event leaves the window, goes through the Node back end, and comes back to every window, including the one that sent it. The worked example is a click on a sidebar menu item.

## ConsoleSidebar

The click handler `loadPanelByName` calls `this.myController.showPanel(name)` ([`src/layout/console/sidebar/ConsoleSidebar.js:480-488`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L480-L488)). The same component registered `onRefresh` as the controller's menu listener ([`ConsoleSidebar.js:107-110`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L107-L110)). So the sidebar learns of its own click when the event comes back from main.

## SidePanelViewController

`showPanel` sets `activeMenuSelection` and calls `fireSidePanelNotifyEvent` ([`src/controllers/SidePanelViewController.js:440-444`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L440-L444)). The notifier and the listener are two `RendererEvent`s on the same channel, `VIEW_CONSOLE_SIDEBAR_PANEL` ([`SidePanelViewController.js:47-50`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L47-L50), [`:75-79`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L75-L79), [`:230-232`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L230-L232)). The state lives on the controller. The event only says "something changed", and the listener re-reads the controller.

## JournalClient

Shown for contrast: data requests don't echo. See *direct send*.

## Echo sonar

`EventManager.initSonar` listens on `echo-event`, parses `{type, arg}` and calls `EventManager.dispatch(type, arg)` ([`public/events/EventManager.js:162-190`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L162-L190)). Its doc comment says it will reflect "any echo event sent by main or renderer processes" ([`EventManager.js:158-161`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L158-L161)).

## EventManager.dispatch

It first calls `tryToSendUpdates`, which sends to every window, then runs any matching main-process listeners ([`EventManager.js:352-403`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L352-L403)).

## JournalController

It receives `journal-client` requests on its own `ipcMain` listener ([`public/controllers/JournalController.js:58-67`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L58-L67)). See *A request's round trip*.

## Listeners on that channel

Any window that created a `RendererEvent` with the same name receives it. Only windows with a matching listener act. The status bar, Fervie and chart windows don't have a sidebar controller, so they ignore `VIEW_CONSOLE_SIDEBAR_PANEL`. Each window has its own controller instances, so a listener in another window would read *its own* controller's state, not the console's.

## showPanel

See *ConsoleSidebar*.

## dispatch with echo

`fireSidePanelNotifyEvent` calls `this.sidePanelChangeNotifier.dispatch({})` ([`SidePanelViewController.js:339-341`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L339-L341)). With no `noEcho`, `RendererEventManager.dispatch` sends `{type, arg}` on `echo-event` ([`src/events/RendererEventManager.js:290-297`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L290-L297)). Navigation works the same way: `BrowserController`'s load event is dispatched with no flags ([`src/controllers/BrowserController.js:128-130`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L128-L130)).

## re-dispatch

See *Echo sonar*.

## broadcast

`webContents.send(eventType, json)` goes to each window in `WindowManager.windows` ([`EventManager.js:391-403`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L391-L403)). The renderer's `listenForCallback` receives it and calls the registered callback ([`RendererEventManager.js:228-259`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L228-L259)). The trip costs two IPC hops and a JSON round trip for every UI notification. The repo doesn't say whether that was a deliberate choice, for example to let any window react to UI changes in another.

## direct send

Clients dispatch with `noEcho = true` ([`src/clients/JournalClient.js:309`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L309)), which is a plain `ipcRenderer.send(event.type, jsonArg)` ([`RendererEventManager.js:288-289`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L288-L289)). It reaches the controller's listener without the sonar. The reply still comes back to every window (see *A request's round trip*).
