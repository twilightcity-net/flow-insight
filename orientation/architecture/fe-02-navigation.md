# Console navigation: detail

Click-through detail for fe-02-navigation.mmd. Facts are as of commit `872b8ac1` (2025-03-03). The console's main panel is a small in-app **browser**. Content is addressed by URI-like requests, there's back/forward history, and a "load" event swaps the visible component. There's no react-router involved beyond `ViewManager`'s single route.

## Sidebar panels

Panels call `SidePanelViewController.makeSidebarBrowserRequest(request)`, which hands off to the shared `BrowserController` ([`src/controllers/SidePanelViewController.js:459-461`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L459-L461), [`:116-120`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/SidePanelViewController.js?plain=1#L116-L120)). For example, the circuits panel opens a circuit this way ([`src/layout/console/sidebar/circuits/CircuitsPanel.js:403-409`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/circuits/CircuitsPanel.js?plain=1#L403-L409)).

## Notification items

`CircuitNotificationListItem` and `WTFThresholdListItem` call `browserController.makeRequest` directly ([`src/layout/console/sidebar/notifications/CircuitNotificationListItem.js:36`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/notifications/CircuitNotificationListItem.js?plain=1#L36), [`WTFThresholdListItem.js:70`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/notifications/WTFThresholdListItem.js?plain=1#L70)).

## Terminal commands

`TerminalContent` makes a browser request from a terminal result ([`src/layout/console/content/terminal/components/TerminalContent.js:353`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/terminal/components/TerminalContent.js?plain=1#L353)). In all, 13 call sites in `src/` call `makeRequest`.

## Address bar

`BrowserLayout` turns a typed URI into an `open` request ([`src/layout/console/content/BrowserLayout.js:237-244`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/BrowserLayout.js?plain=1#L237-L244)). It also issues a default request on start ([`BrowserLayout.js:129`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/BrowserLayout.js?plain=1#L129)).

## BrowserController

`makeRequest` pushes the request to history and processes it ([`src/controllers/BrowserController.js:47-51`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L47-L51)). `processRequest` parses the request into a resource, records the URI, and fires the load event ([`BrowserController.js:160-169`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L160-L169)). All callers get the **same** instance, because `RendererControllerFactory` caches it under `LAYOUT_BROWSER` ([`src/controllers/RendererControllerFactory.js:63-84`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/RendererControllerFactory.js?plain=1#L63-L84), [`:101-102`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/RendererControllerFactory.js?plain=1#L101-L102)).

## Request history

There's a `MAX_HISTORY_SIZE` of 10 ([`BrowserController.js:10`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L10)). A new request after going back truncates the forward history, the way a web browser does ([`BrowserController.js:96-110`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L96-L110)). Back and forward move an index and re-process the stored request without pushing it again ([`BrowserController.js:62-82`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L62-L82)).

## MainPanelViewController

It owns the listener for `WINDOW_CONSOLE_BROWSER_LOAD`, and lets `LayoutContent` attach its handler ([`src/controllers/MainPanelViewController.js:4-25`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/MainPanelViewController.js?plain=1#L4-L25)). It shares nothing with `BrowserController` except that channel name. It also defines the resource names ([`MainPanelViewController.js:27-43`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/MainPanelViewController.js?plain=1#L27-L43)).

## LayoutContent

It gets `MainPanelViewController` from the factory and registers its load handler on mount ([`src/layout/console/content/LayoutContent.js:36-55`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/LayoutContent.js?plain=1#L36-L55)).

## Resource components

`getActiveComponent` maps the resource name to `TerminalResource`, `JournalResource`, `CircuitResource` (for `wtf`), `RetroResource`, `FlowResource`, `DashboardResource`, `ControlResource`, `PlayResource`, `MoovieResource` or `ToolsResource` ([`LayoutContent.js:77-130`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/LayoutContent.js?plain=1#L77-L130)). Each receives the whole resource as a prop, so it can read the rest of the path, such as the username in `/journal/me`.

## open request

A request is a string of the form `action::uri` (the separator is `"::"`, [`src/controllers/BrowserRequestFactory.js:46-48`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserRequestFactory.js?plain=1#L46-L48)), for example `open::/journal/me`. `createRequestFromUri` builds the `open` form ([`BrowserRequestFactory.js:201-205`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserRequestFactory.js?plain=1#L201-L205)). `createRequest(type, …)` builds typed ones such as `CIRCUIT`, `JOURNAL` or `TERMINAL` ([`BrowserRequestFactory.js:140-152`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserRequestFactory.js?plain=1#L140-L152)).

## push or move

See *Request history*.

## browser-load event

`fireConsoleBrowserLoadNotifyEvent(resource)` calls `consoleBrowserLoadNotifier.dispatch(resource)` with no flags ([`BrowserController.js:128-130`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/controllers/BrowserController.js?plain=1#L128-L130)), so it's echoed through the main process. The parsing step, `UtilRenderer.getResourceFromRequest`, lowercases the request, splits on `::` and `/`, and returns `{action, uri, uriArr}` ([`src/UtilRenderer.js:593-624`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/UtilRenderer.js?plain=1#L593-L624)).

## broadcast

Main's sonar re-dispatches the echo, and `EventManager.dispatch` sends it to every window ([`public/events/EventManager.js:162-190`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L162-L190), [`:391-403`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L391-L403)). Only the console window has a `MainPanelViewController` listening, so only it reacts. See *UI events take the long way*.

## onConsoleBrowserLoadEvent

`LayoutContent` stores the resource in state. It hides the address bar for `terminal`, `play` and `moovie` ([`LayoutContent.js:57-75`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/LayoutContent.js?plain=1#L57-L75)).

## switch on first segment

`resource.uriArr[0]` selects the component ([`LayoutContent.js:82-85`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/LayoutContent.js?plain=1#L82-L85)). `none` renders nothing, and `error` has its own case ([`LayoutContent.js:126-130`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/LayoutContent.js?plain=1#L126-L130)).

## Node back end

Navigation doesn't need the back end, but it passes through it anyway. The load event is echoed through Electron main and broadcast back (see *broadcast*). No data is fetched until the resource component that's displayed asks its client for some.
