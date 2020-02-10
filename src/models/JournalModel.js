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

    this.name = "[JournalModel]";

    this.allJournalItems = [];
    this.allIntentions = [];
    this.activeSize = 0;

    this.activeJournalItem = null;
    this.activeIndex = 0;
    this.activeFlame = 0;

    this.recentProjects = [];
    this.recentTasksByProjectId = [];
    this.recentEntry = {};

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

  /**
   * the possible types of callback events
   * @returns {{ACTIVE_ITEM_UPDATE: string, NEW_JOURNAL_ITEM_ADDED: string, JOURNAL_HISTORY_UPDATE: string, RECENT_TASKS_UPDATE: string}}
   * @constructor
   */
  static get CallbackEvent() {
    return {
      ACTIVE_ITEM_UPDATE: "active-item-update",
      RECENT_TASKS_UPDATE: "recent-tasks-update",
      JOURNAL_HISTORY_UPDATE: "journal-history-update",
      NEW_JOURNAL_ITEM_ADDED: "journal-item-added"
    };
  }

  /**
   * gets the active scope for a selected user
   * @returns {AltMemberJournalExtension|JournalModel}
   */
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
      console.log(this.name + " reset member selection to me -> " + memberId);
      this.isAltMemberSelected = false;
      this.altMemberId = null;
      this.altModelDelegate.resetMemberSelection();
      this.resetActiveToLastJournalItem();
      this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
      this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);
      return;
    }

    console.log(this.name + " set member selection to  -> " + memberId);
    this.isAltMemberSelected = true;
    this.altMemberId = memberId;
    this.altModelExtension.setMemberSelection(memberId);
    this.loadDefaultJournal();
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
    let remoteUrn =
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.JOURNAL +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.ME,
      loadRequestType = DataModel.RequestTypes.GET;

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
    this.activeIndex = 0;
    this.activeJournalItem = null;

    if (this.allJournalItems.length > 0) {
      this.activeJournalItem = this.allJournalItems[
        this.allJournalItems.length - 1
      ];
      this.activeIndex = this.activeJournalItem.index;
      this.activeFlame = this.activeJournalItem.flameRating;
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
   * @param taskName
   */
  addTaskRef = taskName => {
    console.log(this.name + " - Request - addTaskRef");

    let remoteUrn =
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.JOURNAL +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.ME +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.TASK_REF,
      loadRequestType = DataModel.RequestTypes.POST,
      args = { taskName: taskName };

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
   * @param projectId
   * @param taskId
   * @param description
   */
  addJournalEntry = (projectId, taskId, description) => {
    console.log(this.name + " - Request - addJournalEntry");

    let remoteUrn =
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.JOURNAL +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.ME +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.INTENTION,
      loadRequestType = DataModel.RequestTypes.POST,
      args = {
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
   * @param intentionId
   * @param finishStatus
   */
  finishIntention = (intentionId, finishStatus) => {
    console.log(this.name + " - Request - finishIntention");

    let remoteUrn =
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.JOURNAL +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.ME +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.INTENTION +
        DataModel.Paths.SEPARATOR +
        intentionId +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.TRANSITION +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.FINISH,
      loadRequestType = DataModel.RequestTypes.POST,
      args = {
        finishStatus: finishStatus
      };

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
   * @param journalItem
   * @param flameRating
   */
  updateFlameRating = (journalItem, flameRating) => {
    console.log(this.name + " - Request - updateFlameRating");

    if (!journalItem) return;

    if (journalItem.journalEntryType === "Intention") {
      this.updateFlameRatingForIntention(journalItem, flameRating);
    } else if (journalItem.journalEntryType === "WTF") {
      this.updateFlameRatingForWTFCircle(journalItem, flameRating);
    }
  };

  /**
   * updates the flame rating for the given intention
   * @param journalItem
   * @param flameRating
   */
  updateFlameRatingForIntention = (journalItem, flameRating) => {
    console.log(this.name + " update flame rating for journal item");
    let remoteUrn =
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.JOURNAL +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.ME +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.INTENTION +
        DataModel.Paths.SEPARATOR +
        journalItem.id +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.TRANSITION +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.FLAME,
      loadRequestType = DataModel.RequestTypes.POST,
      args = {
        flameRating: flameRating
      };
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
  //
  // /**
  //  * updates the flame ratings for wtf circuits
  //  * @param journalItem
  //  * @param flameRating
  //  */
  // updateFlameRatingForWTFCircle = (journalItem, flameRating) => {
  //   let remoteUrn = "/journal/wtf/" + journalItem.id + "/transition/flame";
  //   let loadRequestType = DataModel.RequestTypes.POST;
  //   let args = { flameRating: flameRating };
  //
  //   journalItem.flameRating = Number(flameRating);
  //
  //   this.remoteFetch(
  //     args,
  //     remoteUrn,
  //     loadRequestType,
  //     JournalEntryDto,
  //     (dtoResults, err) => {
  //       setTimeout(() => {
  //         this.onUpdateFlameRatingCb(dtoResults, err);
  //       }, DataModel.activeWaitDelay);
  //     }
  //   );
  // };

  /**
   * Refresh recent task references for the journal drop down
   */
  refreshRecentTaskReferences = () => {
    console.log(this.name + " - Request - refreshRecentTaskReferences");

    let remoteUrn =
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.JOURNAL +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.ME +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.TASK_REF +
        DataModel.Paths.SEPARATOR +
        DataModel.Paths.RECENT,
      loadRequestType = DataModel.RequestTypes.GET;

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

  /**
   * called when we want to load the default user journal
   * @param defaultJournal
   * @param err
   */
  onLoadDefaultJournalCb = (defaultJournal, err) => {
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      this.initFromDefaultJournal(defaultJournal);
    }
    this.isInitialized = true;

    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
    this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);
  };

  /**
   * called when we referecne a new intention
   * @param recentTasksSummary
   * @param err
   */
  onAddTaskRefCb = (recentTasksSummary, err) => {
    if (err) {
      console.log(this.name + " - error:" + err);
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

  /**
   * called when we refresh an intention in our view
   * @param recentTasksSummary
   * @param err
   */
  onRefreshRecentTaskRefsCb = (recentTasksSummary, err) => {
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      this.recentTasksByProjectId = recentTasksSummary.recentTasksByProjectId;
    }
    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
  };

  /**
   * callback for when we add a new journal entry
   * @param savedEntry
   * @param err
   */
  onAddJournalEntryCb = (savedEntry, err) => {
    if (err) {
      console.log(this.name + " - error:" + err);
    } else {
      let recentEntry = {
          projectId: savedEntry.projectId,
          taskId: savedEntry.taskId,
          description: savedEntry.description
        },
        journalItem = this.createJournalItem(
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

  /**
   * called when we finish creating a new journal entry
   * @param savedEntry
   * @param err
   */
  onFinishJournalEntryCb = (savedEntry, err) => {
    if (err) {
      console.log(this.name + " - error:" + err);
    }
  };

  /**
   * callback for when we update a flame rating
   * @param savedEntry
   * @param err
   */
  onUpdateFlameRatingCb = (savedEntry, err) => {
    if (err) {
      console.log(this.name + " - error:" + err);
    }
  };

  /**
   * callback for when we change the finish state of the last item in the journal
   * NOTE: this is to be consistent with the server, which auto-updates the last intention status
   * need to skip over any WTFs
   */
  updateFinishStatusOfLastJournalItem = () => {
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

  /**
   * initialize a new journal from a users existing journal as a template
   * @param defaultJournal
   */
  initFromDefaultJournal = defaultJournal => {
    let journalItems = this.createJournalItems(defaultJournal.recentIntentions),
      recentIntentionKeys = this.extractRecentIntentionKeys(
        defaultJournal.recentIntentions
      ),
      activeJournalItem = null,
      activeIndex = 0;

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

  /**
   * get the recent entries keys for display
   * @param allEntries
   * @returns {{}}
   */
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

  /**
   * creates and array of journal items to display in the gui
   * @param allEntries
   * @returns {*}
   */
  createJournalItems = allEntries => {
    let journalItems = [];

    for (var i in allEntries) {
      journalItems[i] = this.createJournalItem(i, allEntries[i]);
    }

    return journalItems;
  };

  /**
   * creates a single journal item for the storage in the journal items array for the gui
   * @param index
   * @param journalEntry
   * @returns {{journalEntryType: *, index: *, flameRating: number, description: *, taskSummary: *, rawDate: Date, finishStatus: string, taskName: *, id: *, circleId: *, position: string, projectName: *, linked: (boolean|boolean)}}
   */
  createJournalItem = (index, journalEntry) => {
    let d = journalEntry.position,
      dateObj = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]),
      flameRating = Number(0);

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
      linked: journalEntry.linked ? Boolean(journalEntry.linked) : false,
      journalEntryType: journalEntry.journalEntryType,
      circleId: journalEntry.circleId,
      position: moment(dateObj).format("ddd, MMM Do 'YY, h:mm a"),
      rawDate: dateObj
    };
  };
}
