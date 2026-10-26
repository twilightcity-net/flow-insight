# Front-end layers: detail

Click-through detail for fe-01-layers.mmd. Facts are as of commit `872b8ac1` (2025-03-03). This is the React side of the two halves described in the overview. Everything here runs in a browser window, and the only way out is the IPC bus to the Node back end.

## index.js

`ReactDOM.render(<ViewManager />, ROOT_)`, with Semantic UI's CSS imported globally ([`src/index.js:1-13`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/index.js?plain=1#L1-L13)). The UI kit throughout is `semantic-ui-react` ([`package.json:89`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L89)).

## ViewManager

It reads `view` from the query string and returns the matching view, passing the other keys as `routeProps` ([`src/views/ViewManager.js:38-97`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L38-L97)). See *Windows and views* on the Architecture tab for how each window sets `?view=`.

## View component

There are fourteen views ([`src/views/ViewManager.js:7-20`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L7-L20)). Each one is the root of one kind of window. `ConsoleView` is the main app: it initializes the clients and renders `<ConsoleLayout />` ([`src/views/ConsoleView.js:129-147`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ConsoleView.js?plain=1#L129-L147), [`:222-225`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ConsoleView.js?plain=1#L222-L225)).

## Layout and components

`src/layout/` holds the component tree. `ConsoleLayout` renders `ConsoleSidebar` and `LayoutContent` ([`src/layout/ConsoleLayout.js:2-3`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/ConsoleLayout.js?plain=1#L2-L3)). Under them are the sidebar panels (team, buddies, circuits, fervie, notifications, dashboard) and the content "resources" (journal, circuit, flow, terminal, dashboard, play, retro, control, moovie, tools). The *Console navigation* diagram shows how a resource is chosen.

## Clients

These are 21 singleton classes in `src/clients/`, one per back-end domain. Each wraps one IPC channel and keeps a map of pending replies. See *A request's round trip* on the Architecture tab for the journal example ([`src/clients/JournalClient.js:18-73`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L18-L73)).

## View controllers

These are 14 classes in `src/controllers/`, created and cached by name through `RendererControllerFactory` ([`src/controllers/RendererControllerFactory.js:63-84`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/RendererControllerFactory.js?plain=1#L63-L84), [`:91-120`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/RendererControllerFactory.js?plain=1#L91-L120)). They hold UI state, such as which sidebar panel is active or the browser's history, and announce changes as events. They never call the server. The base class is tiny ([`src/controllers/ActiveViewController.js:3-14`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/ActiveViewController.js?plain=1#L3-L14)). The cache is per window: each window is its own renderer process with its own `controllers` map. Two components that ask for the same name get the same instance, which is how the sidebar and the address bar share one `BrowserController`.

## RendererEventManager

A thin wrapper over `ipcRenderer` ([`src/events/RendererEventManager.js:1`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L1)). Its `dispatch` chooses between three ways out: synchronous send, direct send, or echo through the main process ([`RendererEventManager.js:274-297`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L274-L297)). Channel names come from `RendererEventFactory`, which duplicates the main process's list by hand.

## Node back end

See the Architecture tab: *A request's round trip* and *Data and state*.

## renders

React rendering: `ViewManager` renders the chosen view under one `<Route path="/">` ([`ViewManager.js:115-123`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L115-L123)), and views render their layouts.

## picks by view param

`ViewManager.View()` → `getViewWithProps(name, props)`, an `if`/`else if` chain on the upper-cased name ([`ViewManager.js:49-97`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ViewManager.js?plain=1#L49-L97)).

## init singletons

`XClient.init(this)` creates each client once per window ([`src/clients/JournalClient.js:51-55`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L51-L55)). `ConsoleView` initializes eighteen of them ([`ConsoleView.js:129-147`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ConsoleView.js?plain=1#L129-L147)).

## data calls

Components call static client methods with a scope and a callback, for example `TeamClient.getAllMyTeams(this, …)` ([`src/layout/console/sidebar/team/TeamPanel.js:279`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/team/TeamPanel.js?plain=1#L279)). The answer usually comes from the back end's LokiJS cache.

## UI coordination

Components get their controller with `RendererControllerFactory.getViewController(name, this)`. For example, `ConsoleSidebar` asks for `CONSOLE_SIDEBAR` ([`src/layout/console/sidebar/ConsoleSidebar.js:52-54`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L52-L54)). A sidebar click calls `myController.showPanel(name)` ([`ConsoleSidebar.js:480-488`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/ConsoleSidebar.js?plain=1#L480-L488)).

## direct send

Clients dispatch with `noEcho = true`, which is a plain `ipcRenderer.send(type, json)` to the main-process listener ([`src/clients/JournalClient.js:309`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L309), [`RendererEventManager.js:288-289`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L288-L289)).

## echoed events

View controllers dispatch with no flags, for example `this.sidePanelChangeNotifier.dispatch({})` ([`src/controllers/SidePanelViewController.js:339-341`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L339-L341)). That takes the `echo-event` path ([`RendererEventManager.js:290-297`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L290-L297)). See *UI events take the long way*.

## IPC

The only boundary crossing. Windows run with `nodeIntegration: true, contextIsolation: false` ([`public/windows/ConsoleWindow.js:51-57`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/windows/ConsoleWindow.js?plain=1#L51-L57)), so the front end can `window.require("electron")` directly. There's no preload script in between.
