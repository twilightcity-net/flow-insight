# A request's round trip: detail

Click-through detail for 04-ipc-round-trip.mmd. Facts are as of commit `872b8ac1` (2025-03-03). The journal is the worked example. The other renderer clients in `src/clients/` and controllers in `public/controllers/` follow the same shape.

**The two halves.** An Electron app has two halves. The **front end** is React, running in a browser window (Electron's renderer). It draws the screen. The **back end of the front end** is Node, running in Electron's main process. It makes the web requests and keeps the local database. The two halves talk only over the **IPC bus**: named events sent across the boundary and replied to. The back end fetches data from the server and stores it in the local LokiJS database. When the front end asks for the same data again, for instance on a re-render or refresh, the back end answers from that database instead of going back to the server. That's the maintainers' explanation, given in the session that produced this site (2026-10-26). The code below shows it at work.

## React component

The console view initializes every client singleton when it mounts ([`src/views/ConsoleView.js:129-147`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/views/ConsoleView.js?plain=1#L129-L147)). Components then call static methods such as `JournalClient.getRecentIntentions(username, scope, callback)` ([`src/clients/JournalClient.js:139-147`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L139-L147)). A component never calls the server or touches the database. It asks, and gets plain JSON back.

## JournalClient

On construction it creates a renderer event on `JOURNAL_CLIENT`, with `onJournalEventReply` as its reply handler ([`src/clients/JournalClient.js:18-26`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L18-L26)). Each call wraps its args in a `RendererClientEvent` ([`src/clients/BaseClient.js:162-170`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/BaseClient.js?plain=1#L162-L170)). It records the call in `JournalClient.replies` by id, then dispatches it ([`JournalClient.js:301-310`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L301-L310)). When a reply arrives, the client looks up `replies.get(arg.id)`, removes the entry and runs the stored callback ([`JournalClient.js:281-293`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L281-L293)).

## Main EventManager

The back-end end of the bus. A single instance is created first in `onReady` ([`public/app/App.js:174`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L174)). Every `MainEvent` registers itself on construction ([`public/events/EventManager.js:57-60`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L57-L60)). That binds `ipcMain.on(type, listener)` ([`EventManager.js:200-212`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L200-L212)). The listener JSON-parses the arg and runs the callback ([`EventManager.js:222-268`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L222-L268)).

## JournalController

It's created by `JournalManager` ([`public/managers/JournalManager.js:10-14`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/JournalManager.js?plain=1#L10-L14)), and it dispatches on `arg.type` ([`public/controllers/JournalController.js:75-127`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L75-L127)). Its key job is deciding whether the cache can answer. For `get-recent-intentions` that test is `userHistory.has(username)`, a set of users whose journals are already loaded ([`JournalController.js:483-485`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L483-L485)).

## JournalDatabase cache

A LokiJS subclass with `intentions`, `projects` and `tasks` collections ([`public/database/JournalDatabase.js:1-30`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/JournalDatabase.js?plain=1#L1-L30)). It's memory only, and every window shares it. See the *Data and state* diagram for all eleven databases.

## DtoClient

`BaseController.doClientRequest` builds a request record and calls `new DtoClient(store, callback).doRequest()` ([`public/controllers/BaseController.js:474-486`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L474-L486)). The callback always fires, with either `store.data` or `store.error` set ([`public/managers/DtoClientFactory.js:84-117`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/DtoClientFactory.js?plain=1#L84-L117)).

## Gridtime API

For a journal load the URN is `/journal/<username>`, with an optional limit ([`JournalController.js:147-174`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L147-L174)). Path constants are in `BaseController.Paths` ([`BaseController.js:15-30`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L15-L30)).

## EventFactory names

The back end's list of channel names, for example `JOURNAL_CLIENT: prefix + "journal-client"` ([`public/events/EventFactory.js:46`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventFactory.js?plain=1#L46)).

## RendererEventFactory names

The front end's duplicate list, which must match by string, for example `JOURNAL_CLIENT: prefix + "journal-client"` ([`src/events/RendererEventFactory.js:75`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventFactory.js?plain=1#L75)).

## call with callback

The client stores the callback. `BaseClient.delegateCallback` runs it when the reply comes back ([`src/clients/BaseClient.js:148-152`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/BaseClient.js?plain=1#L148-L152)).

## IPC request

The only way across the boundary. `notifyJournal` calls `this.event.dispatch(clientEvent, true)` ([`src/clients/JournalClient.js:309`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/clients/JournalClient.js?plain=1#L309)). With `noEcho = true`, that's a plain `ipcRenderer.send(event.type, jsonArg)` on the `journal-client` channel ([`src/events/RendererEventManager.js:274-290`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L274-L290)). The front end can reach Electron directly because windows run with `nodeIntegration: true, contextIsolation: false` ([`public/windows/ConsoleWindow.js:51-57`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/windows/ConsoleWindow.js?plain=1#L51-L57)).

## callback by channel

`createListener` runs `executeCallback`, which calls the controller's bound handler ([`EventManager.js:322-330`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L322-L330)). The controller's `switch` then picks the handler for the request type ([`JournalController.js:84-125`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L84-L125)).

## cache hit

The user's journal is already in memory, so the controller reads it straight from Loki: `collection.chain().find({username}).simplesort(timestamp).data()`. It replies with no server call ([`JournalController.js:483-496`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L483-L496)). This is the common path for re-renders and refreshes.

## cache miss

The first request for a user goes to the server through `handleLoadJournalEvent` ([`JournalController.js:497-520`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L497-L520)). Projects and tasks follow the same pattern; their handlers are even named `…WithFallback` ([`JournalController.js:101-112`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L101-L112)). The cache is also emptied on purpose when the heartbeat reports `REFRESH`, so the next request misses ([`JournalController.js:134-139`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L134-L139)).

## GET or POST

Those are the only verbs `DtoClient.getRequest` supports ([`DtoClientFactory.js:125-146`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/DtoClientFactory.js?plain=1#L125-L146)).

## callback stores result

`delegateLoadJournalCallback` writes the server's intentions, plus projects and tasks for the logged-in user, into the database. Then it adds the user to `userHistory`, so the next request is a hit ([`JournalController.js:184-243`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L184-L243)). On an error it records `arg.error` and does neither.

## replyTo

`delegateCallbackOrEventReplyTo` calls a direct callback for back-end callers (such as `JournalManager.init` at startup) or `event.replyTo(arg)` for front-end callers ([`BaseController.js:553-561`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L553-L561)). `MainEvent.replyTo` dispatches `type + "-reply"` ([`EventManager.js:50-52`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L50-L52)).

## IPC reply

The reply crosses back as `journal-client-reply`. There's no per-window addressing: `tryToSendUpdates` sends it to **every** open window ([`EventManager.js:391-403`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L391-L403)). The front end listens on `type + "-reply"` ([`src/events/RendererEventManager.js:197`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L197)). Only the window whose client has that request id acts on it.

## copied by hand

This is dashed because nothing generates or checks the duplicate name list. The main `EventManager` comment says the renderer helper is "used to help look up event names in the render process that are defined here. When creating new events make sure to update both classes" ([`public/events/EventManager.js:112-115`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L112-L115)).
