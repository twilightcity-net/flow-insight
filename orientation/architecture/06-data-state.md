# Data and state: detail

Click-through detail for 06-data-state.mmd. Facts are as of commit `872b8ac1` (2025-03-03).

## LokiJS cache

**What it is.** [LokiJS](https://github.com/techfort/LokiJS) is an in-memory document database for JavaScript. This app uses it as a **cache in the main process**: a local copy of the server data the UI needs. Every database class extends `LokiJS` ([`public/database/JournalDatabase.js:1-9`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/JournalDatabase.js?plain=1#L1-L9)). `VolumeManager` holds all of them in one `Map` ([`public/managers/VolumeManager.js:16-30`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L16-L30)). `AppLoader` calls it "our data warehouse to put store our in memory databases in" ([`public/app/AppLoader.js:428-430`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppLoader.js?plain=1#L428-L430)).

**Its life cycle**, each step an arrow in the diagram:

1. **Created empty** at startup, one database per domain.
2. **Filled** by `LOAD_*` fetches from the Gridtime API.
3. **Patched** by Talknet pushes between fetches.
4. **Read** by every window through `GET_*` requests to main-process controllers.
5. **Rebuilt** when the heartbeat reports `REFRESH` or the socket reconnects.
6. **Thrown away** at quit. It's never saved: no `autosave`, `saveDatabase` or persistence adapter appears under `public/database` or `public/managers`.

**Why it exists.** The maintainers explained it in the session that produced this site (2026-10-26). React in the browser window is the front end, and Node in Electron's main process is "the back end of the front end": it makes the web requests and stores data locally. Data fetched from the server goes into this local database. When React asks for it again, on a re-render or refresh, the back end answers from the database instead of going back to the server. Keeping the cache in main also means every window shares one copy, and one socket keeps it current. The code bears this out: see *cache hit* and *cache miss* in *A request's round trip*.

**Who touches it.** Only main-process controllers. Eleven of them call `DatabaseFactory.getDatabase` (Flow, Journal, Fervie, TalkTo, Dictionary, Member, Notification, TeamCircuit, Circuit, Team, Talk). Nothing in `src/` imports LokiJS.

**The eleven databases** ([`public/database/DatabaseFactory.js:22-36`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/DatabaseFactory.js?plain=1#L22-L36)):

| Database | Collections | Filled by |
|---|---|---|
| journal | intentions, projects, tasks ([`JournalDatabase.js:71-107`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/JournalDatabase.js?plain=1#L71-L107)) | startup LOAD (JournalManager) |
| circuit | circuits, participating, solved, later, retro, active, team-circuits, circuit-members ([`CircuitDatabase.js:89-172`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/CircuitDatabase.js?plain=1#L89-L172)) | startup LOAD (Circuit and TeamCircuit managers), pushes |
| team | teams ([`TeamDatabase.js:65-75`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/TeamDatabase.js?plain=1#L65-L75)) | startup LOAD (TeamManager), pushes |
| member | me, members ([`MemberDatabase.js:66-73`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/MemberDatabase.js?plain=1#L66-L73)) | startup LOAD (MemberManager), pushes |
| dictionary | dictionary ([`DictionaryDatabase.js:60-71`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/DictionaryDatabase.js?plain=1#L60-L71)) | startup LOAD (DictionaryManager), pushes |
| notification | notification, pair-request ([`NotificationDatabase.js:64-108`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/NotificationDatabase.js?plain=1#L64-L108)) | startup LOAD (NotificationManager) |
| buddy | buddies, pendingRequest ([`BuddyDatabase.js:63-84`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/BuddyDatabase.js?plain=1#L63-L84)) | startup LOAD (FervieManager) |
| talk | rooms, plus two collections **per chat room**, created when the first message arrives ([`TalkDatabase.js:68-76`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/TalkDatabase.js?plain=1#L68-L76), [`:84-163`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/TalkDatabase.js?plain=1#L84-L163)) | Talknet pushes |
| dm | message, reaction ([`DMDatabase.js:62-91`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/DMDatabase.js?plain=1#L62-L91)) | TalkToController ([`TalkToController.js:534`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkToController.js?plain=1#L534)) |
| emoji | emoji ([`EmojiDatabase.js:56-64`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/EmojiDatabase.js?plain=1#L56-L64)) | FervieController ([`FervieController.js:417`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/FervieController.js?plain=1#L417)) |
| flow | flow ([`FlowDatabase.js:50`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/FlowDatabase.js?plain=1#L50)) | FlowController ([`FlowController.js:98-110`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/FlowController.js?plain=1#L98-L110)) |

All but `flow` register a LokiJS **dynamic view** on each collection. Views are what `GET_*` handlers read.

## settings.json

The file is `~/.flow/settings.json` ([`public/Util.js:215-220`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/Util.js?plain=1#L215-L220)), managed by `electron-settings` ([`public/app/AppSettings.js:1`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L1), [`:37`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L37)). It's the one piece of app state that survives a restart. The cache doesn't. (The plugin feed folders and `flowinsight-config.json` files in code modules are also on disk; see the *System* diagram.)

## AppSettings

`save(apiUrl, apiKey)` stores the URL and an AES-encrypted key, and sets default display and shortcut values ([`public/app/AppSettings.js:196-210`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L196-L210)). Feature toggles are a comma list ([`AppSettings.js:130-162`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L130-L162)).

## VolumeManager

`init()` creates eleven empty databases ([`VolumeManager.js:35-70`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L35-L70)). It then asks the Journal, Circuit, TeamCircuit, Team, Fervie (buddy), Notification, Member and Dictionary managers to fill theirs ([`VolumeManager.js:72-78`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L72-L78), [`:105-171`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/VolumeManager.js?plain=1#L105-L171)). Controllers reach a database with `DatabaseFactory.getDatabase(name)`, which reads `VolumeManager`'s map ([`DatabaseFactory.js:79-81`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/DatabaseFactory.js?plain=1#L79-L81)).

## Main controllers

Most data controllers split their events into two kinds:
- **`LOAD_*`** events fetch from the API and write to the cache. Example: `LOAD_ALL_MY_TEAMS`.
- **`GET_*`** events read from the cache. Example: `GET_ALL_MY_TEAMS` ([`public/controllers/TeamController.js:31-39`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TeamController.js?plain=1#L31-L39)).

Not every `GET_*` across the codebase reads Loki. Account, feature and hotkey controllers have `GET_*` events with no database behind them. Each manager owns its controller: `JournalManager` → `JournalController` ([`public/managers/JournalManager.js:10-14`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/JournalManager.js?plain=1#L10-L14)).

## Gridtime API

The source of truth the cache mirrors. The default URL is `https://home.twilightcity.net` ([`public/app/AppConfig.js:12`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppConfig.js?plain=1#L12)).

## Talknet socket

`TalkController` handles `message_client`, `message_room`, `join_room` and `leave_room` ([`public/controllers/TalkController.js:37-54`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L37-L54), [`:288-376`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L288-L376)). A room message can touch the talk, team, member, circuit, journal, dictionary and notification databases ([`TalkController.js:684-720`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L684-L720)).

## AppHeartbeat

It posts to `/account/heartbeat` every 60 s ([`public/app/AppHeartbeat.js:20`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppHeartbeat.js?plain=1#L20), [`:31`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppHeartbeat.js?plain=1#L31)). The server answers `SUCCESS`, `REFRESH` or, on a network error, `FAILED` ([`AppHeartbeat.js:113-133`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppHeartbeat.js?plain=1#L113-L133)). The result is dispatched as `APP_HEARTBEAT` ([`AppHeartbeat.js:145-148`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppHeartbeat.js?plain=1#L145-L148)).

## Renderer panels

React components never read Loki directly. They call a client, such as `TeamClient.getAllMyTeams` in the team panel ([`src/layout/console/sidebar/team/TeamPanel.js:279`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/sidebar/team/TeamPanel.js?plain=1#L279)), and receive plain JSON. They also listen for refresh events, as `JournalResource` does for `JOURNAL_DATA_REFRESH` ([`src/layout/console/content/journal/JournalResource.js:82-87`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/journal/JournalResource.js?plain=1#L82-L87)).

## AES-encrypted API key

The key is encrypted with `crypto-js` AES ([`AppSettings.js:197`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L197)). The passphrase is a string literal in the source, with a `TODO` above it ([`AppSettings.js:45-47`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L45-L47)). On read, an 88-character value is decrypted and anything else is returned as-is ([`AppSettings.js:234-246`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L234-L246)). A file-level comment says "FIXME the crypto is disabled as its not working with java to decode it" ([`AppSettings.js:18`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/app/AppSettings.js?plain=1#L18)), but `save()` does encrypt.

## creates 11 databases

Each database class sets up its collections, indices and dynamic views in its constructor. For example, `JournalDatabase` indexes intentions by id, username, memberId, taskId, projectId and more ([`JournalDatabase.js:67-107`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/database/JournalDatabase.js?plain=1#L67-L107)).

## startup LOAD

Each manager's `init` calls its controller's load handler directly, with a callback in place of an IPC event. `JournalManager.init` does so with `handleLoadJournalEvent` ([`JournalManager.js:16-26`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/JournalManager.js?plain=1#L16-L26)). `TeamManager.init` does so with `handleLoadAllMyTeamsEvent` ([`public/managers/TeamManager.js:22-28`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/managers/TeamManager.js?plain=1#L22-L28)). When enough callbacks return, the loader moves on (see *volumes ready* in *Startup lifecycle*).

## LOAD fetches

`BaseController.doClientRequest` sends REST requests through `DtoClient` ([`public/controllers/BaseController.js:474-486`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L474-L486)). See *A request's round trip*.

## upsert by id

The common write is "find by id, remove, insert the server's copy". It's `BaseController.findRemoveXInsertDoc` ([`BaseController.js:624-631`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L624-L631)), or the same steps inline, as in the team load ([`TeamController.js:245-261`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TeamController.js?plain=1#L245-L261)). Chat messages use insert-if-missing, `findXOrInsertDoc` ([`BaseController.js:610-615`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L610-L615)).

## pushed changes

`handleTalkMessageRoomCallback` switches on the message type and writes into the matching database:
- chat details go to the room's collection ([`TalkController.js:742-748`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L742-L748));
- team-member changes update both `member` and `team` ([`TalkController.js:749-769`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L749-L769));
- XP updates go to both ([`TalkController.js:770-777`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L770-L777)).

After the cache is updated, the raw message is also broadcast to every window ([`TalkController.js:945`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L945)). A panel can therefore react to the push itself, or re-GET from the fresh cache.

## REFRESH reloads all

`TalkController.onAppHeartbeat` calls `refreshDataFromScratch` on `REFRESH`, and also when the socket was down ([`TalkController.js:383-405`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L383-L405)). That re-runs the member, team, circuit, dictionary and notification loads, and resets the journal's per-user cache so the next read goes to the server ([`TalkController.js:444-470`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L444-L470), [`JournalController.js:134-139`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L134-L139)). The heartbeat triggers this when pushes might have been missed.

## GET request

A `GET_*` request is answered from the cache. If the cache is empty, there's a fallback: `handleGetAllMyTeamsEvent` checks `view.count() === 0` and runs the load first ([`TeamController.js:302-333`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TeamController.js?plain=1#L302-L333)). The journal tracks which users it has loaded in `userHistory`, and reads from Loki only for those ([`JournalController.js:465-495`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/JournalController.js?plain=1#L465-L495)).

## dynamic view data

`BaseController.delegateCallbackWithView` puts `view.data()` (the view's documents) into the reply ([`BaseController.js:570-584`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/BaseController.js?plain=1#L570-L584)). Example getter: `TeamDatabase.getViewForTeams()` ([`TeamController.js:306`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TeamController.js?plain=1#L306)).

## reply to every window

The reply goes out as `<channel>-reply` to every window. The client that sent the request matches it by id (see *A request's round trip*). The documents arrive with Loki's own bookkeeping fields, and the UI depends on at least one: `JournalEntry` reads `$loki` ([`src/layout/console/content/journal/components/JournalEntry.js:35-41`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/journal/components/JournalEntry.js?plain=1#L35-L41), [`:192-203`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/src/layout/console/content/journal/components/JournalEntry.js?plain=1#L192-L203)). So the cache's internal ids leak into the UI.

## data-refresh events

After each reload finishes, `refreshDataFromScratch` dispatches `ME_`, `TEAM_`, `CIRCUIT_`, `DICTIONARY_`, `JOURNAL_`, `NOTIFICATION_` and `DM_DATA_REFRESH` ([`TalkController.js:444-470`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L444-L470)). They're created in `configureEvents` ([`TalkController.js:119-165`](https://github.com/twilightcity-net/flow-insight/blob/872b8ac1decccc17531fcb98e3a8ed1f0053e0ec/public/controllers/TalkController.js?plain=1#L119-L165)). Panels respond by sending a fresh `GET_*`.
