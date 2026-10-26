# System at a glance: detail

Click-through detail for 01-system.mmd. Facts are as of commit `872b8ac1` (2025-03-03).

## Developer

The README pitches the app as "a desktop console application that gives you smart stats for your workflow, to support data-driven learning and improve efficiency of your team" ([`README.md:14`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/README.md?plain=1#L14)). The developer is both the user whose flow is measured and, for this repo, the person running it from source ([`README.md:19-25`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/README.md?plain=1#L19-L25)).

## IDE plugins

Plugins are not in this repo. The app scans `~/.flow/plugins` for them. The class comment says it manages "the plugins in the ~/.flow/plugins directory, register the plugins, and manage sending data to the server via the flow publisher" ([`public/job/PluginRegistrationHandler.js:11-12`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/job/PluginRegistrationHandler.js?plain=1#L11-L12)). Unregistered plugins trigger a registration window and a `POST /account/plugin/registration` ([`PluginRegistrationHandler.js:135-176`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/job/PluginRegistrationHandler.js?plain=1#L135-L176)).

The repo doesn't say which IDEs have plugins or where they're published.

## ~/.flow folder

`Util.getFlowHomePath()` is `path.join(os.homedir(), ".flow")`, described as "our .flow directory that TC and our plugins share" ([`public/Util.js:203-209`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/Util.js?plain=1#L203-L209)). It holds `settings.json` ([`Util.js:215-220`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/Util.js?plain=1#L215-L220)) and `plugins/` ([`Util.js:227-233`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/Util.js?plain=1#L227-L233)).

## React windows

`src/index.js` renders `<ViewManager />` into `#root` ([`src/index.js:12-13`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/index.js?plain=1#L12-L13)). Every window loads the same bundle and picks its view from `?view=`. See the *Windows and views* diagram.

## Electron main process

`package.json` sets `"main": "public/electron.js"` ([`package.json:16`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L16)), which only does `global.App = new App()` ([`public/electron.js:1-11`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/electron.js?plain=1#L1-L11)). `App.onReady` builds about forty singleton managers on `global.App` ([`public/app/App.js:173-216`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/App.js?plain=1#L173-L216)). The *Startup lifecycle* diagram follows it from there.

## Gridtime API

The README names "a metrics engine called Gridtime" ([`README.md:16`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/README.md?plain=1#L16)) and gives `https://flow.twilightcity.net` as production ([`README.md:19`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/README.md?plain=1#L19)). The code disagrees: `AppConfig.defaultApiUrl = "https://home.twilightcity.net"` ([`public/app/AppConfig.js:12`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L12)), and `getAppApi()` always returns it ([`AppConfig.js:27-37`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L27-L37)).

## Talknet server

"a peer-to-peer socket server called Talknet" ([`README.md:16`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/README.md?plain=1#L16)). The URL is fixed at `https://talk.twilightcity.net` ([`public/app/AppConfig.js:13`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L13)).

## Local mock server

`yarn server` runs `node server/Server.js` ([`package.json:38`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L38)). That's an Express app on `PORT` or 5000 that serves only `/account/activate`, `/heartbeat`, `/login` and `/logout` ([`server/Server.js:9-43`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/server/Server.js?plain=1#L9-L43)). The API tests start it in their setup file ([`test/SetupApi.js:7`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/test/SetupApi.js?plain=1#L7)).

## uses

The developer interacts with the console, the active-status bar, the Fervie window and the getting-started window. The loader opens the last three once loading is done ([`public/app/AppLoader.js:237-255`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L237-L255)).

## write active.flow

The feed file name is `active.flow`. The publisher moves it through `preprocess/`, `publish_queue/`, `archive/` and `publish_error/` folders ([`public/job/FlowFeedProcessor.js:24-30`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/job/FlowFeedProcessor.js?plain=1#L24-L30)). The plugins do the writing, so the format is defined outside this repo.

## IPC events

Renderer events go out with `ipcRenderer.send(event.type, jsonArg)`, or by an "echo-event" when echo is wanted ([`src/events/RendererEventManager.js:274-297`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/events/RendererEventManager.js?plain=1#L274-L297)). The main `EventManager.register` binds `ipcMain.on(event.type, …)` ([`public/events/EventManager.js:200-203`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L200-L203)).

## broadcast to every window

`EventManager.dispatch` first calls `tryToSendUpdates`, which does `webContents.send(eventType, jsonArg)` to **every** window, and only then runs matching main-process listeners ([`public/events/EventManager.js:352-403`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/events/EventManager.js?plain=1#L352-L403)).

## settings and flow feeds

`AppSettings` points `electron-settings` at `~/.flow/settings.json` ([`public/app/AppSettings.js:37`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L37)). `AppFlowPublisherJob` runs every 10 minutes, after a 20-second delay. It validates plugins, then for each one archives, preprocesses and publishes its feed batches ([`public/app/AppFlowPublisherJob.js:22-23`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppFlowPublisherJob.js?plain=1#L22-L23), [`:99-136`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppFlowPublisherJob.js?plain=1#L99-L136)).

## REST with X-API-Key

`DtoClient.doRequest` builds `global.App.api + urn` and sets `X-API-Key` when a key is loaded ([`public/managers/DtoClientFactory.js:59-82`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/DtoClientFactory.js?plain=1#L59-L82)). It supports only GET and POST, using `superagent` with a 30-second timeout ([`DtoClientFactory.js:50-53`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/DtoClientFactory.js?plain=1#L50-L53), [`:125-146`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/DtoClientFactory.js?plain=1#L125-L146)).

## socket.io

`TalkManager.createConnection` opens `io(talkUrl + "?connectionId=…")` with up to 3 reconnection attempts ([`public/managers/TalkManager.js:41-71`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/TalkManager.js?plain=1#L41-L71), [`:77-83`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/TalkManager.js?plain=1#L77-L83)). The `connectionId` comes from the login response.

## yarn dev:local

`dev:local` starts the mock server and passes `SERVER=http://localhost:5000 TALK=http://localhost:5050` to Electron ([`package.json:34`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/package.json?plain=1#L34)). But the code that read those arguments is commented out ([`public/app/AppConfig.js:27-53`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L27-L53)), and nothing else in `public/` or `src/` reads them. As of this commit, `dev:local` and `dev:grid` still talk to production. That's why the arrow is dashed and stops at the mock.

## LokiJS cache

The back end keeps an in-memory copy of server data in eleven LokiJS databases, so that a re-render or refresh in a window doesn't fetch from the server again. It's filled at startup ([`public/managers/VolumeManager.js:35-79`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L35-L79)), and nothing is saved to disk. See *A request's round trip* for a cache hit and miss, and *Data and state* for every database.

## caches server data

Controllers write fetched data into Loki, then answer later requests from it. An example is the journal's `userHistory` check ([`public/controllers/JournalController.js:483-496`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L483-L496)).
