import { DataModel } from "./DataModel";
import moment from "moment";
import { AltMemberJournalExtension } from "./AltMemberJournalExtension";
import { AltModelDelegate } from "./AltModelDelegate";

const { remote } = window.require("electron"),
  RecentJournalDto = remote.require("./dto/RecentJournalDto"),
  JournalEntryDto = remote.require("./dto/JournalEntryDto"),
  RecentTasksSummaryDto = remote.require("./dto/RecentTasksSummaryDto");

export class JournalModel extends DataModel {
  constructor(scope) {
    super(scope);

    this.allJournalItems = [];
    this.allIntentions = [];
    this.activeSize = 0;

    this.activeJournalItem = null;
    this.activeIndex = 0;
    this.activeFlame = 0;

    this.recentProjects = [];
    this.recentTasksByProjectId = [];
    this.recentEntry = {};

    this.isInitialized = false;

    this.isAltMemberSelected = false;
    this.altMemberId = null;

    this.altModelExtension = new AltMemberJournalExtension(this.scope);
    this.altModelDelegate = new AltModelDelegate(this, this.altModelExtension);

    this.altModelDelegate.configureDelegateCall("loadDefaultJournal");
    this.altModelDelegate.configureDelegateCall("resetActiveToLastJournalItem");
    this.altModelDelegate.configureDelegateCall("setActiveJournalItem");

    this.altModelDelegate.configureNoOp("finishIntention");
    this.altModelDelegate.configureNoOp("updateFlameRating");
    this.altModelDelegate.configureNoOp("addJournalEntry");
    this.altModelDelegate.configureNoOp("addTaskRef");
  }

  static get CallbackEvent() {
    return {
      ACTIVE_ITEM_UPDATE: "active-item-update",
      RECENT_TASKS_UPDATE: "recent-tasks-update",
      JOURNAL_HISTORY_UPDATE: "journal-history-update",
      NEW_JOURNAL_ITEM_ADDED: "journal-item-added"
    };
  }

  isNeverLoaded = () => {
    return this.isInitialized === false;
  };

  getActiveScope = () => {
    if (this.isAltMemberSelected) {
      return this.altModelExtension;
    } else {
      return this;
    }
  };

  /**
   * Show an alt member's journal
   * @param meId
   * @param memberId
   */
  setMemberSelection = (meId, memberId) => {
    if (meId === memberId) {
      this.isAltMemberSelected = false;
      this.altMemberId = null;

      this.altModelDelegate.resetMemberSelection();
      this.resetActiveToLastJournalItem();

      this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
      this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);
    } else {
      this.isAltMemberSelected = true;
      this.altMemberId = memberId;

      //should set the memberId on the object, then delegate the call

      this.altModelExtension.setMemberSelection(memberId);
      this.loadDefaultJournal();
    }
  };

  /**
   * Restore the showing of the default journal
   */
  resetMemberSelection = () => {
    this.isAltMemberSelected = false;
    this.altMemberId = null;

    this.altModelDelegate.resetMemberSelection();
  };

  /**
   * Loads the most recent Journal with X number of entries,
   * which should ultimately be a configurable setting
   * but hardcoded on the server for now
   */

  loadDefaultJournal = () => {
    let remoteUrn = "/journal";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      RecentJournalDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onLoadDefaultJournalCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Reset the active selected item to the last item in the journal
   */
  resetActiveToLastJournalItem = () => {
    if (this.allJournalItems.length > 0) {
      let lastItem = this.allJournalItems[this.allJournalItems.length - 1];

      this.activeJournalItem = lastItem;
      this.activeIndex = lastItem.index;
      this.activeFlame = lastItem.flameRating;
    } else {
      this.activeIndex = 0;
      this.activeJournalItem = null;
    }

    this.notifyListeners(JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE);
  };

  /**
   * Set the active selected item to a specific item in the journal
   * @param journalItem
   */
  setActiveJournalItem = journalItem => {
    this.activeIndex = journalItem.index;
    this.activeJournalItem = journalItem;
    this.activeFlame = journalItem;

    this.notifyListeners(JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE);
  };


  /**
   * Add a new task reference on the server, so intentions can be added for this task
   */
  addTaskRef = taskName => {
    let remoteUrn = "/journal/taskref";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { taskName: taskName };

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      RecentTasksSummaryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onAddTaskRefCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Add a new Journal Entry to the Journal history
   */

  addJournalEntry = (projectId, taskId, description) => {
    let remoteUrn = "/journal/intention";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = {
      projectId: projectId,
      taskId: taskId,
      description: description
    };

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onAddJournalEntryCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Update the finish status of an existing intention
   */

  finishIntention = (intentionId, finishStatus) => {
    let remoteUrn = "/journal/intention/" + intentionId + "/transition/finish";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { finishStatus: finishStatus };

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onFinishJournalEntryCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Update the finish status of an existing intention or WTF
   */

  updateFlameRating = (journalItem, flameRating) => {
    if (journalItem.journalEntryType === "Intention") {
      this.updateFlameRatingForIntention(journalItem, flameRating);
    } else if (journalItem.journalEntryType === "WTF") {
      this.updateFlameRatingForWTFCircle(journalItem, flameRating);
    }
  };

  updateFlameRatingForIntention = (journalItem, flameRating) => {
    let remoteUrn =
      "/journal/intention/" + journalItem.id + "/transition/flame";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { flameRating: flameRating };

    journalItem.flameRating = Number(flameRating);

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onUpdateFlameRatingCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  updateFlameRatingForWTFCircle = (journalItem, flameRating) => {
    let remoteUrn = "/journal/wtf/" + journalItem.id + "/transition/flame";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { flameRating: flameRating };

    journalItem.flameRating = Number(flameRating);

    this.remoteFetch(
      args,
      remoteUrn,
      loadRequestType,
      JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onUpdateFlameRatingCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Refresh recent task references for the journal drop down
   */
  refreshRecentTaskReferences = () => {
    let remoteUrn = "/journal/taskref/recent";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      RecentTasksSummaryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onRefreshRecentTaskRefsCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  //////////// REMOTE CALLBACK HANDLERS  ////////////

  onLoadDefaultJournalCb = (defaultJournal, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      this.initFromDefaultJournal(defaultJournal);
    }
    this.isInitialized = true;

    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
    this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);
  };

  onAddTaskRefCb = (recentTasksSummary, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      let activeTask = recentTasksSummary.activeTask;
      if (activeTask) {
        this.recentEntry = {
          projectId: activeTask.projectId,
          taskId: activeTask.id,
          description: activeTask.summary
        };

        this.recentTasksByProjectId = recentTasksSummary.recentTasksByProjectId;
      }
    }
    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
  };

  onRefreshRecentTaskRefsCb = (recentTasksSummary, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      this.recentTasksByProjectId = recentTasksSummary.recentTasksByProjectId;
    }
    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
  };

  onAddJournalEntryCb = (savedEntry, err) => {
    if (err) {
      console.log("error:" + err);
    } else {
      let recentEntry = {
        projectId: savedEntry.projectId,
        taskId: savedEntry.taskId,
        description: savedEntry.description
      };

      let journalItem = this.createJournalItem(
        this.allJournalItems.length,
        savedEntry
      );

      this.updateFinishStatusOfLastJournalItem();

      this.allJournalItems = [...this.allJournalItems, journalItem];
      this.activeSize = this.allJournalItems.length;
      this.recentEntry = recentEntry;

      this.activeIndex = journalItem.index;
      this.activeJournalItem = journalItem;
      this.activeFlame = journalItem.flameRating;

      this.notifyListeners(JournalModel.CallbackEvent.NEW_JOURNAL_ITEM_ADDED);
      this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);

      this.refreshRecentTaskReferences();
    }
  };

  onFinishJournalEntryCb = (savedEntry, err) => {
    if (err) {
      console.log("error:" + err);
    }
  };

  onUpdateFlameRatingCb = (savedEntry, err) => {
    if (err) {
      console.log("error:" + err);
    }
  };

  updateFinishStatusOfLastJournalItem = () => {
    //this is to be consistent with the server, which auto-updates the last intention status
    //need to skip over any WTFs

    for (var i = this.allJournalItems.length - 1; i >= 0; --i) {
      let lastItem = this.allJournalItems[i];

      if (lastItem.journalEntryType === "Intention") {
        if (!lastItem.finishStatus) {
          lastItem.finishStatus = "done";
        }
        break;
      }
    }
  };

  initFromDefaultJournal = defaultJournal => {
    var journalItems = this.createJournalItems(defaultJournal.recentIntentions);
    let recentIntentionKeys = this.extractRecentIntentionKeys(
      defaultJournal.recentIntentions
    );

    let activeJournalItem = null;
    let activeIndex = 0;

    if (journalItems.length > 0) {
      activeJournalItem = journalItems[journalItems.length - 1];
      activeIndex = activeJournalItem.index;
    }

    this.allJournalItems = journalItems;
    this.activeJournalItem = activeJournalItem;
    this.activeIndex = activeIndex;

    this.recentProjects = defaultJournal.recentProjects;
    this.recentTasksByProjectId = defaultJournal.recentTasksByProjectId;
    this.recentEntry = recentIntentionKeys;

    this.allIntentions = defaultJournal.recentIntentions;
    this.activeSize = defaultJournal.recentIntentions.length;
  };

  extractRecentIntentionKeys = allEntries => {
    let latestKeys = {};

    if (allEntries != null && allEntries.length > 0) {
      let lastEntry = allEntries[allEntries.length - 1];

      latestKeys = {
        projectId: lastEntry.projectId,
        taskId: lastEntry.taskId,
        description: lastEntry.description
      };
    }
    return latestKeys;
  };

  createJournalItems = allEntries => {
    let journalItems = [];

    for (var i in allEntries) {
      journalItems[i] = this.createJournalItem(i, allEntries[i]);
    }

    return journalItems;
  };

  createJournalItem = (index, journalEntry) => {
    let d = journalEntry.position;
    let dateObj = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);

    let flameRating = Number(0);
    if (journalEntry.flameRating != null) {
      flameRating = Number(journalEntry.flameRating);
    }

    return {
      index: index,
      id: journalEntry.id,
      flameRating: flameRating,
      projectName: journalEntry.projectName,
      taskName: journalEntry.taskName,
      taskSummary: journalEntry.taskSummary,
      description: journalEntry.description,
      finishStatus: journalEntry.finishStatus,
      journalEntryType: journalEntry.journalEntryType,
      circleId: journalEntry.circleId,
      position: moment(dateObj).format("ddd, MMM Do 'YY, h:mm a"),
      rawDate: dateObj
    };
  };
}
