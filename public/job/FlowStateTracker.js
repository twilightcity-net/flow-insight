const log = require("electron-log"),
  chalk = require("chalk");
const Util = require("../Util");
const {DtoClient} = require("../managers/DtoClientFactory");
const EventFactory = require("../events/EventFactory");
const AppConfig = require("../app/AppConfig");


/**
 * This class is used to track realtime flow state for this user
 * @type {FlowStateTracker}
 */
module.exports = class FlowStateTracker {
  constructor() {
    this.name = "[FlowStateTracker]";
    this.buckets = this.createInitialBuckets();
    this.fileActivityBuckets = this.createInitialFileActivityBuckets();
    this.snapshot = null;
    this.momentum = 0;
    this.isInitialized = false;
    this.me = null;
    this.pluginsInitialized = new Map();

    this.activityState = FlowStateTracker.ActivityState.IDLE;
    this.lastActivityEvent = null;
    this.streakStartTime = null;
  }

  static KEY_TIME = "as.of.time";
  static KEY_MOMENTUM = "current.momentum";
  static KEY_MODCOUNT = "mod.keycounts";
  static ACTIVITY_THRESHOLD = 150;
  static MAX_MOMENTUM = 200;
  static EVENT_ME_UPDATE = "update-me";

  static THRESHOLD_OF_IDLE_SECONDS_BEFORE_IDLE = 60 * 30;
  static THRESHOLD_OF_INACTIVE_SECONDS_BEFORE_NEW_STREAK = 60 * 60;

  static HOURS_BACK = 2;
  static BUCKETS_PER_HOUR = 12;
  static TOTAL_MOMENTUM_BUCKETS = FlowStateTracker.HOURS_BACK * FlowStateTracker.BUCKETS_PER_HOUR;

  static MAX_FILE_ACTIVITY_BUCKETS = 14;

  //TODO currently buckets can grow indefinitely until there's a new flow state on the server,
  // need to add bucket rolling capability for file activity, and then summarization capability for reporting
  //note, we're also going to need to be able to detect a long streak of idle activity
  //so that we can trigger events based on that, I can match the activities based on buckets
  //where I've got editor activity happening but no modification activity, and we need to detect a streak
  //if I've got activity that is in the oldest bucket, that exceeds the bucket size, we can also just
  //truncate this one to 5 minutes, so that way an old entry can't overpower the most recent hour,
  //I guess I should do that for any entry that has a duration that exceeds the age, we should truncate

  static get ActivityState() {
    return {
      IDLE : "IDLE",
      FLOW: "FLOW"
    }
  }

  /**
   * Refresh latest flow state from the server, and update current status after
   * adjusting to the latest server status + any recent activity processing
   */
  refresh() {
    this.initializeIfNeeded();
    this.doFetchLatestFlowState((arg) => {
      if (arg.error) {
        this.handleFailedSnapshotRefresh(arg.error);
      } else {
        this.updateSnapshotFlowState(arg.data);
      }
    });
    this.updateActivityStateIfIdle();
  }

  /**
   * Get a summary of the current flow activity stream
   */
  getActivitySummary() {
    return {
      momentum: this.momentum,
      activityStreak: this.getStreakLengthForStartTime(this.streakStartTime),
      activityState: this.activityState
    }
  }

  /**
   * If a streak start time is set, figure out the number of seconds between
   * that start and the current time.
   * @param startTimeForStreak
   */
  getStreakLengthForStartTime( startTimeForStreak ) {
    if (startTimeForStreak) {
      return Util.getTimeDifferenceInSeconds(startTimeForStreak, Util.getCurrentLocalTimeString());
    } else {
      return 0;
    }
  }

  initializeIfNeeded() {
    if (!this.isInitialized) {
      this.me = global.App.MemberManager.getMe();
      if (this.me) {
        this.lastTaskId = this.me.activeTaskId;
        this.lastWorkingOn = this.me.workingOn;
      }

      this.memberEventListener =
        EventFactory.createEvent(
          EventFactory.Types.MEMBER_CONTROLLER,
          this,
          this.onMemberControllerEvent
        );

      this.troubleThresholdEventListener =
        EventFactory.createEvent(
          EventFactory.Types.TROUBLE_THRESHOLD_EVENT,
          this,
          this.onTroubleThresholdEvent
        );
    }
  }

  onMemberControllerEvent(event, arg) {
    if (arg.type === FlowStateTracker.EVENT_ME_UPDATE) {
      let newMe = arg.data;
      log.debug("[FlowStateTracker] processing me update event...");

      if (this.isTaskSwitch(newMe)) {
        log.debug(this.name + "Task switch event!  Momentum Reset");
        this.resetMomentum();
        this.resetActivityStreak();
      } else if (AppConfig.isFlowJournalApp() && this.isNewIntention(newMe)) {
        //in the flow journal app, we get momentum credit just for entering intentions
        log.debug(this.name + "New Intention!  Momentum credits");
        this.grantActivityForMomentum(500);
      }

      //don't overwrite our last task with a temporary null
      if (newMe.activeTaskId) {
        this.lastTaskId = newMe.activeTaskId;
        this.lastWorkingOn = newMe.workingOn;
      } else {
        log.debug("ignoring taskId of blank waiting for next task update");
      }
      this.me = newMe;
    }
  }

  /**
   * Reset our momentum when troubleshooting threshold is reached
   * @param event
   * @param arg
   */
  onTroubleThresholdEvent(event, arg) {
    log.debug(this.name + "Troubleshoot Threshold event!  Momentum Reset");
    this.resetMomentum();

    //TODO do we want to reset activity when we leave a long trouble session?
    //for now, we will do this reset so that we don't end up in a situation where momentum is 0
    //and we have a long streak that makes it look like we've just been idling, which isn't true
    this.resetActivityStreak();
  }

  /**
   * Determine if there is a task switch, taking into account, if an intention is finished
   * our active task can temporarily go blank and shouldn't invoke a switch
   * @param newMe
   */
  isTaskSwitch(newMe) {
    if (this.me && newMe && this.lastTaskId && newMe.activeTaskId) {
      if (this.lastTaskId !== newMe.activeTaskId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determine if there is a new intention focus, which we should get momentum credit for
   * @param newMe
   * @returns {boolean}
   */
  isNewIntention(newMe) {
    if (this.me && newMe && this.lastTaskId && newMe.activeTaskId) {
      if (this.lastWorkingOn !== newMe.workingOn) {
        return true;
      }
    }
    return false;
  }


  /**
   * Reset the current momentum to 0, persists the event in the bucket for this time period,
   * so the reset will be processed during recalculations, then broadcast the update
   */
  resetMomentum() {
    let currentTime = Util.getCurrentTime();
    let bucket = this.findOrCreateBucket(currentTime);

    bucket.resetEvent = true;

    this.updateMomentumAndBroadcastOnChange(0);
  }

  resetActivityStreak() {
    this.streakStartTime = null;
  }

  grantActivityForMomentum(amount) {
    let currentTime = Util.getCurrentTime();
    let bucket = this.findOrCreateBucket(currentTime);

    bucket.count += amount;

    this.recalculateMomentum();
  }

  /**
   * Process a single modification activity
   * @param modificationActivity
   */
  processModificationActivity(modificationActivity) {
    let modCount = modificationActivity.modificationCount;

    this.updateActivityStateAndActiveStreak(modificationActivity.endTime);

    let bucket = this.findOrCreateBucket(modificationActivity.endTime);
    bucket.count += modCount;

    this.recalculateMomentum();
  }

  /**
   * Process a single editor activity, we capture the file activity events within
   * 5 minute buckets, so we can correlate which files were active over a time window
   * @param editorActivity
   */
  processEditorActivity(editorActivity) {
    log.debug(this.name + " Adding file activity to bucket for file: " + editorActivity.filePath);

    this.updateActivityStateAndActiveStreak(editorActivity.endTime);

    let bucket = this.findOrCreateFileActivityBucket(editorActivity.endTime);

    const module = editorActivity.module;
    const filePath = editorActivity.filePath;
    const duration = editorActivity.durationInSeconds;

    if (bucket) {
      if (!bucket.fileActivity) {
        bucket.fileActivity = [];
      }
      bucket.fileActivity.push({module: module, filePath: filePath, duration: duration});
    }
    this.rollFileActivityBuckets();
  }

  /**
   * Update activity state to FLOW when we get a new event,
   * and if we've got a new activity streak starting, or are continuing an existing streak,
   * update the active streak properties accordingly
   *
   * @param newEventTime
   */
  updateActivityStateAndActiveStreak( newEventTime ) {

    log.debug(this.name + "New event endtime: "+newEventTime + ", last event: "+this.lastActivityEvent);
    this.activityState = FlowStateTracker.ActivityState.FLOW;

    if (this.lastActivityEvent) {
      let timeDiff = Util.getTimeDifferenceInSeconds(this.lastActivityEvent, newEventTime);

      if (timeDiff > FlowStateTracker.THRESHOLD_OF_INACTIVE_SECONDS_BEFORE_NEW_STREAK) {
         //restart streak
        log.debug(this.name + " Restarting activity streak");
        this.streakStartTime = newEventTime;
      }
    } else {
      log.debug(this.name + " Initializing activity streak");
      //first file activity since we booted the app, start a new streak
      this.streakStartTime = newEventTime;
    }

    this.lastActivityEvent = newEventTime;
  }



  /**
   * Call this periodically on an interval to set the activityState to IDLE
   * when there hasnt been activity in a while
   */
  updateActivityStateIfIdle() {
    log.debug(this.name + " Checking for idle activity state...");
    const currentTime = Util.getCurrentLocalTimeString();
    if (this.lastActivityEvent) {
      let timeSinceLastActivity = Util.getTimeDifferenceInSeconds(this.lastActivityEvent, currentTime);

      if (timeSinceLastActivity > FlowStateTracker.THRESHOLD_OF_IDLE_SECONDS_BEFORE_IDLE) {
        log.debug(this.name + " Setting activity state to IDLE and resetting streak.");
        this.activityState = FlowStateTracker.ActivityState.IDLE;
        this.streakStartTime = null;
        this.lastActivityEvent = null;
      }
    }
  }


  /**
   * Find or create a new bucket for holding data for a specific time
   * @param dateTime
   */
  findOrCreateBucket(dateTime) {
    let modTime = this.truncateTimeFiveMinutes(dateTime);

    let bucket = this.buckets.get(modTime.getTime());
    if (bucket) {
      return bucket;
    } else {
      log.debug("[FlowStateTracker] Creating new bucket for " + modTime);
      let bucketCounter = {
        bucket: modTime,
        count: 0,
      }
      this.buckets.set(modTime.getTime(), bucketCounter);
      return bucketCounter;
    }
  }

  /**
   * Find or create a new file activity bucket for holding data for a specific time
   * @param dateTime
   */
  findOrCreateFileActivityBucket(dateTime) {
    let modTime = this.truncateTimeFiveMinutes(dateTime);

    let bucket = this.fileActivityBuckets.get(modTime.getTime());
    if (bucket) {
      return bucket;
    } else {
      log.debug("[FlowStateTracker] Creating new file activity bucket for " + modTime);
      let fileActivityBucket = {
        bucket: modTime,
        count: 0,
        fileActivity: []
      }
      this.fileActivityBuckets.set(modTime.getTime(), fileActivityBucket);
      return fileActivityBucket;
    }
  }

  /**
   * Take in a new batch of flow activity and update our flow state.
   * We only process batch data when we haven't initialized with anything yet
   * Expected format: {"durationInSeconds":30,"endTime":"2023-04-17T08:57:20","modificationCount":61}
   * @param pluginId
   * @param flowBatchDto
   */
  processBatch(pluginId, flowBatchDto) {
    if (this.checkIfAlreadyInitializedAndSetFlag(pluginId)) return;

    log.info("[FlowStateTracker] Updating flow state for batch from plugin: " + pluginId + "!");
    this.loadModificationsIntoBuckets(flowBatchDto);
    this.loadEditorActivityIntoBuckets(flowBatchDto);

    this.recalculateMomentum();
  }

  /**
   * Sets initialization flag and checks if already set
   * @param pluginId
   * @returns {boolean}
   */
  checkIfAlreadyInitializedAndSetFlag(pluginId) {
    if (this.pluginsInitialized.get(pluginId)) {
      return true;
    } else {
      this.pluginsInitialized.set(pluginId, true);
      return false;
    }
  }

  /**
   * Recalculate momentum based on the snapshot time, taking all the recent modifications
   * into account, to bring the momentum value up to date
   */
  recalculateMomentum() {
    let slotCounts = this.createInitialSlotCounts();
    let momentum = this.createInitialMomentum();

    let consecutiveIdleCount = 0;

    let orderedKeys = this.extractOrderedKeys(this.buckets);

    for (let key of orderedKeys) {
      let bucket = this.buckets.get(key);
      let total = this.sumWindow(bucket.count, slotCounts);
      slotCounts = this.shiftLeft(slotCounts, bucket.count);

      if (total > FlowStateTracker.ACTIVITY_THRESHOLD) {
        momentum += 5;
        consecutiveIdleCount = 0;
      } else if (total < FlowStateTracker.ACTIVITY_THRESHOLD) {
        momentum -= 2.5;
        consecutiveIdleCount++;
      }

      momentum = Util.clamp(momentum, 0, FlowStateTracker.MAX_MOMENTUM);

      if (consecutiveIdleCount > 12 || bucket.resetEvent === true) {
        console.log("[FlowStateTracker] momentum reset! "+consecutiveIdleCount + " || "+bucket.resetEvent);
        momentum = 0;
      }
    }

    this.updateMomentumAndBroadcastOnChange(momentum);
  }


  /**
   * Update our momentum state and only send updates to the UI
   * if there's a change in the values
   * @param momentum
   */
  updateMomentumAndBroadcastOnChange(momentum) {
    log.debug("[FlowStateTracker] Updating momentum = "+momentum);

    if (this.momentum !== momentum) {
      this.momentum = momentum;
      global.App.FlowManager.updateMyFlow({momentum: this.momentum});
    }
  }

  /**
   * Get a list of the keys of the map in sorted order
   * @param map
   */
  extractOrderedKeys(map) {
    let keys =[ ...map.keys() ];
    keys.reverse();
    return keys;
  }

  /**
   * Create initial momentum value for calculation based on our snapshot as long
   * as the snapshot is not too old
   */
  createInitialMomentum() {
    let twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    if (this.snapshot) {
      if (this.snapshot.time > twoHoursAgo) {
        return this.snapshot.momentum;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  /**
   * Create the initial slot counts, either from our snapshot, or default to all zeros
   */
  createInitialSlotCounts() {
    let slotCounts = [];
    if (this.snapshot && this.snapshot.rollover && this.snapshot.rollover.bucketHistory) {
      slotCounts.push(this.snapshot.rollover.bucketHistory[3]); //oldest at the front
      slotCounts.push(this.snapshot.rollover.bucketHistory[2]);
      slotCounts.push(this.snapshot.rollover.bucketHistory[1]);
      slotCounts.push(this.snapshot.rollover.bucketHistory[0]); //newest at the end
    } else {
      slotCounts = [0,0,0,0];
    }
    return slotCounts;
  }

  /**
   * Put newest element on the end of the array and drop the first
   * to shift the window one position
   * @param array
   * @param newElement
   * @returns {*}
   */
  shiftLeft(array, newElement) {
     array.splice(0, 1);
     array.push(newElement);
     return array;
  }

  /**
   * Sum all the numbers within the window
   */
  sumWindow(count, slotCounts) {
    return count + slotCounts[0] + slotCounts[1] + slotCounts[2] + slotCounts[3];
  }

  /**
   * Load the modification counts from the most recent batch into our
   * 5min buckets, the counts within the same bucket will be totaled
   */
  loadModificationsIntoBuckets(flowBatchDto) {
    for (let modificationActivity of flowBatchDto.modificationActivityList) {
      let modTime = this.truncateTimeFiveMinutes(modificationActivity.endTime);
      let modCount = modificationActivity.modificationCount;

      let bucket = this.buckets.get(modTime.getTime());
      if (bucket) {
        bucket.count += modCount;
      } else {
        log.debug("[FlowStateTracker] Ignoring mods, no bucket found for "+modTime);
      }
    }
  }

  /**
   * Load the editor activity summarization into buckets.  These we have position and duration,
   * so the placement of the items within 5 min bands will be based on the end timing of the activity
   */
  loadEditorActivityIntoBuckets(flowBatchDto) {
    for (let editorActivity of flowBatchDto.editorActivityList) {
      const editorEndTime = this.truncateTimeFiveMinutes(editorActivity.endTime);

      const module = editorActivity.module;
      const filePath = editorActivity.filePath;
      const duration = editorActivity.durationInSeconds;

      let bucket = this.fileActivityBuckets.get(editorEndTime.getTime());
      if (bucket) {
        if (!bucket.fileActivity) {
          bucket.fileActivity = [];
        }
        bucket.fileActivity.push({module: module, filePath: filePath, duration: duration});
      } else {
        log.debug("[FlowStateTracker] Ignoring file activity, no bucket found for "+editorEndTime);
      }
    }
  }



  /**
   * Update the referenced snapshot of the flowstate from the server,
   * and start keeping track of data after this state
   * @param tableResult
   */
  updateSnapshotFlowState(tableResult) {
    log.debug("updateSnapshotFlowState!");

    let rows = tableResult.rowsOfPaddedCells;
    let keyMap = this.toKeyMap(rows);

    let snapshotTime = this.toTimestamp(keyMap.get(FlowStateTracker.KEY_TIME));
    let currentMomentum = this.toInt(keyMap.get(FlowStateTracker.KEY_MOMENTUM));
    let modkeysRollover = this.toRolloverCounts(keyMap.get(FlowStateTracker.KEY_MODCOUNT));

    log.debug("snapshot momentum = "+currentMomentum);``
    log.debug("Snapshot time = "+snapshotTime);

    this.snapshot = {
      time: snapshotTime,
      momentum: currentMomentum,
      rollover: modkeysRollover
    }

    let newBuckets = this.createBucketSet(snapshotTime);
    this.copyDataIntoNewBuckets(newBuckets, this.buckets);

    this.buckets = newBuckets;
  }

  /**
   * Discard bucket data older than recent (hour)
   */
  rollFileActivityBuckets() {
    if (this.fileActivityBuckets.size > FlowStateTracker.MAX_FILE_ACTIVITY_BUCKETS) {
      log.debug("[FlowStateTracker] Rolling buckets, size over threshold, size = "+this.fileActivityBuckets.size);
      let newBuckets = this.createInitialFileActivityBuckets();
      this.copyDataIntoNewBuckets(newBuckets, this.fileActivityBuckets);
      this.buckets = newBuckets;
    }
  }

  /**
   * Creates a reporting data object with a summary of the most recent file activity,
   * and the duration of each file
   */
  getRecentFileActivityReport() {
     let mapByFile = new Map();

     for (let [key, bucket] of this.fileActivityBuckets) {
       if (bucket.fileActivity) {
         this.sumFileActivityDurationIntoMap(mapByFile, bucket.fileActivity)
       }
     }

     return this.createTimeSortedList(mapByFile);
  }

  sumFileActivityDurationIntoMap(mapByFile, fileActivityList) {
    for (let bucketFileActivity of fileActivityList) {
      const fileKey = bucketFileActivity.module + "-" + bucketFileActivity.filePath;
      //log.debug("[FlowStateTracker] File key = "+fileKey);

      let fileFound = mapByFile.get(fileKey);
      if (fileFound) {
        fileFound.duration += bucketFileActivity.duration;
      } else {
        mapByFile.set(fileKey, bucketFileActivity);
      }
    }
  }

  /**
   * Create a list of file activities sorted by time duration
   * @param fileActivityMap
   */
  createTimeSortedList(fileActivityMap) {
     let fileActivities = [];
    for (let [key, fileActivity] of fileActivityMap) {
       fileActivities.push(fileActivity);
    }
    fileActivities.sort(function(a, b) {
      return a.duration - b.duration;
    });

    fileActivities.reverse();

    return fileActivities;
  }

  /**
   * Copy existing snapshot data into the new fresh buckets
   * based our refreshed snapshot
   * @param newBuckets
   * @param oldBuckets
   */
  copyDataIntoNewBuckets(newBuckets, oldBuckets) {
    for (let [key, value] of oldBuckets) {
      let newBucketFound = newBuckets.get(key);

      if (newBucketFound) {
        newBucketFound.count = value.count;
        if (value.fileActivity) {
          newBucketFound.fileActivity = value.fileActivity;
        }
      } else {
        log.debug("[FlowStateTracker] Discarding old bucket "+key);
      }
    }
  }

  createInitialBuckets() {
    let firstBucket = this.truncateTimeFiveMinutes(Util.getCurrentTime());

    let buckets = new Map();
    let bucketCounter = {
      bucket: firstBucket,
      count: 0
    }
    buckets.set(firstBucket.getTime(), bucketCounter);

    return buckets;
  }

  /**
   * Create an initial bucket set of 5 min increments that goes 1 hour back in time
   */
  createInitialFileActivityBuckets() {
    let minTime = this.subtractOneHour(Util.getCurrentTime());
    return this.createBucketSet(minTime);
  }

  /**
   * Create a fresh set of 5min buckets that go from our snapshot time
   * to the current time for counting up our activity across time
   * @param snapshotTime
   */
  createBucketSet(snapshotTime) {
    let firstBucket = this.truncateTimeFiveMinutes(Util.getCurrentTime());
    let snapshotBucket = this.truncateTimeFiveMinutes(snapshotTime);

    let buckets = new Map();

    let currentBucket = firstBucket;
    while( buckets.size < FlowStateTracker.TOTAL_MOMENTUM_BUCKETS && currentBucket >= snapshotBucket) {
      let bucketCounter = {
        bucket: currentBucket,
        count: 0
      }
      buckets.set(currentBucket.getTime(), bucketCounter);
      currentBucket = this.subtractFiveMinutes(currentBucket);
    }

    return buckets;
  }


  /**
   * Subtract 5 minutes from the current time and return it as a new Date object
   * @param time
   * @returns {Date}
   */
  subtractFiveMinutes(time) {
    var timeToReturn = new Date(time);
    timeToReturn.setMinutes(time.getMinutes() - 5);

    return timeToReturn;
  }

  /**
   * Subtract 1 hour from the current time and return it as a new Date object
   * @param time
   * @returns {Date}
   */
  subtractOneHour(time) {
    var timeToReturn = new Date(time);
    timeToReturn.setMinutes(time.getMinutes() - 60);

    return timeToReturn;
  }

  /**
   * Truncate input time to the nearest 5 minute threshold bucket
   * @param time
   * @returns {Date}
   */
  truncateTimeFiveMinutes(time) {
    var timeToReturn = new Date(time);

    timeToReturn.setMilliseconds(0);
    timeToReturn.setSeconds(0);
    timeToReturn.setMinutes(Math.trunc(timeToReturn.getMinutes() / 5) * 5);
    return timeToReturn;
  }

  /**
   * Convert to a rollover data count object if not null
   * Example src format: 158.0 [128.0, 0.0, 0.0, 30.0, 0.0]
   * Within window, newest, older, older, oldest
   * @param rolloverCounts
   */
  toRolloverCounts(rolloverCounts) {
    let rollover = {};
    if (rolloverCounts) {
      let parts = rolloverCounts.replace('[','').replace(']','').replace(',','').split(" ");
      rollover.total = parseFloat(parts[0]);
      rollover.bucketHistory = [];
      rollover.bucketHistory.push(parseFloat(parts[1]));
      rollover.bucketHistory.push(parseFloat(parts[2]));
      rollover.bucketHistory.push(parseFloat(parts[3]));
      rollover.bucketHistory.push(parseFloat(parts[4]));
      rollover.bucketHistory.push(parseFloat(parts[5]));
      return rollover;
    } else {
      return rollover;
    }
  }

  /**
   * Convert to an integer if not null
   * @param intStr
   * @returns {null|number}
   */
  toInt(intStr) {
    if (intStr) {
      return parseInt(intStr);
    } else {
      return null;
    }
  }

  /**
   * Convert to a local date object if not null
   * @param utcTimeStr
   * @return {null|Date}
   */
  toTimestamp(utcTimeStr) {
    if (utcTimeStr) {
      return Util.getDateFromUTCStr(utcTimeStr);
    } else {
      return null;
    }
  }

  /**
   * Convert property rows to a keymap structure
   * @param rows
   * @returns {Map<any, any>}
   */
  toKeyMap(rows) {
    let keyMap = new Map();
    for (let i = 0; i < rows.length; i++) {
      keyMap.set(rows[i][0].trim(), rows[i][1].trim());
    }
    return keyMap;
  }

  /**
   * If snapshot refresh fails, log the error, snapshot will be calculated using the most recent snapshot
   * acquired or null if no snapshot available
   * @param error
   */
  handleFailedSnapshotRefresh(error) {
    log.error("Failed to refresh flow state: "+error);
  }

  /**
   * Retrieve latest flow state from the server
   * @param callback
   */
  doFetchLatestFlowState(callback) {
    this.urn = "/flow/latest";

    this.callback = callback;
    this.store = {
      context: "FlowStateTracker",
      dto: {},
      guid: Util.getGuid(),
      name: "FeedStore",
      requestType: "get",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name + " fetch latest flow state -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


};
