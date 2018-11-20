import React, { Component } from "react";
import TimeScrubber from "./TimeScrubber";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";
import {DataStoreFactory} from "../DataStoreFactory";
import moment from "moment";
import {RendererEventFactory} from "../RendererEventFactory";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");


//
// this component is the tab panel wrapper for the console content
//
export default class JournalLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      recentProjects: [],
      recentTasksByProjectId: [],
      recentEntry: {},
      activeIndex: 0,
      activeSize: 0,
      activeJournalItem: null,
      allJournalItems: [],
      updatedFlame: null
    };

  }

  resetCb = () => {
    this.log("Reset CB!");

    if (this.state.allJournalItems.length > 0) {
      let lastItem = this.state.allJournalItems[this.state.activeSize - 1];

      this.setState({
        activeIndex: lastItem.index,
        activeJournalItem: lastItem
      });

      this.props.onFlameChange(lastItem.flameRating);
    }

  };

  componentWillReceiveProps = (nextProps) => {

    if (this.lastOpenCloseState === 1 && nextProps.consoleIsCollapsed === 0) {
      //if it's now open, and used to be closed, need to reset the window
      this.resetCb();
    }

    this.lastOpenCloseState = nextProps.consoleIsCollapsed;

    this.setState({
      updatedFlame : nextProps.updatedFlame
    });

    if (nextProps.scrubToDate != null && this.lastScrubToDate !== nextProps.scrubToDate) {

      this.lastScrubToDate = nextProps.scrubToDate;

      let index = this.findIndexMatchingDate(nextProps.scrubToDate);

      this.setState({
        activeIndex: index,
        activeJournalItem: this.state.allJournalItems[index]
      });
    }

  };

  findIndexMatchingDate(selectedDateObj) {
    let foundIndex = 0;

    let selectedDay = moment(selectedDateObj).dayOfYear();

    for (var i in this.state.allJournalItems) {
      let journalItem = this.state.allJournalItems[i];

      if (moment(journalItem.rawDate).dayOfYear() >= selectedDay) {
         foundIndex = i;

         break;
      }
    }

    let lastIndex = this.state.allJournalItems.length - 1;
    let lastJournalItem = this.state.allJournalItems[lastIndex];

    if (moment(lastJournalItem.rawDate).dayOfYear() === selectedDay) {
       foundIndex = lastIndex;
    }

    return foundIndex;

  }


  /// performs a simple calculation for dynamic height of items, this
  /// is becuase there will be a slight variation in the screen height
  calculateJournalItemsHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
      timeScrubber: 52,
      journalEntry: 50
    };

    /// subtract the root element's height from total window height that is
    /// half of the clients screen height
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.timeScrubber -
      heights.journalEntry
    );
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("Journal Layout : componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.RECENT_JOURNAL,
      this
    );

    this.newJournalEntryStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.NEW_JOURNAL_ENTRY,
      this
    );

    this.recentTasksStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.RECENT_TASKS,
      this
    );

    this.newTaskStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.NEW_TASK,
      this
    );

    this.updatedFlameStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.UPDATED_FLAME,
      this
    );

    this.updatedFinishStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.UPDATED_FINISH,
      this
    );


    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
  };

  onFinishEntry = (journalEntry, newStatus) => {
    this.log("Journal Layout : onFinishEntry");

    let intentionFinishInput = { id: journalEntry.id, finishStatus: newStatus};

    this.updatedFinishStore.load(
      intentionFinishInput,
      err => {
        setTimeout(() => {
          this.onSaveFinishStatusCb(err);
        }, this.activateWaitDelay);
      }
    );
  };

  onAddEntry = (journalEntry) => {
   this.log("Journal Layout : onAddEntry: "+journalEntry.projectId);

    this.newJournalEntryStore.load(
      journalEntry,
      err => {
        setTimeout(() => {
          this.onSaveEntryCb(err);
        }, this.activateWaitDelay);
      }
    );
  };

  onAddTask = (projectId, taskName) => {
    this.log("Journal Layout : onAddTask: "+projectId + ", "+taskName);

    let taskReference = { taskName };
    this.newTaskStore.load(taskReference,
      err => {
        setTimeout(() => {
          this.onSaveTaskReferenceCb(err);
        }, this.activateWaitDelay);
      })

  };

  onSaveFlameUpdates = (journalItem) => {
    this.log("Journal Layout : onSaveFlameUpdates: "+journalItem.index + ", "+journalItem.flameRating);

    let flameRatingInput = { id: journalItem.id, flameRating: journalItem.flameRating };
    this.updatedFlameStore.load(flameRatingInput,
      err => {
        setTimeout(() => {
          this.onSaveFlameCb(err);
        }, this.activateWaitDelay);
      })
  };

  onSaveFlameCb = (err) => {
    this.log("Journal Layout : onSaveFlameCb");
    if (err) {
      this.updatedFlameStore.dto = new this.updatedFlameStore.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      this.log("Success!!");
    }
  };

  onSaveFinishStatusCb = (err) => {
    this.log("Journal Layout : onSaveFinishStatusCb");
    if (err) {
      this.updatedFinishStore.dto = new this.updatedFinishStore.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      this.log("Success!!");
    }
  };


  onUpdateRecentTaskCb = (err) => {
    this.log("Journal Layout : onUpdateRecentTaskCb");
    if (err) {
      this.recentTasksStore.dto = new this.recentTasksStore.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {
      let recentTasksSummary = this.recentTasksStore.dto;


      this.setState({
        recentTasksByProjectId: recentTasksSummary.recentTasksByProjectId
      });

      this.log("Success!!");
    }
  };



  onSaveTaskReferenceCb = (err) => {
    this.log("Journal Layout : onSaveTaskReferenceCb saving!");
    if (err) {
      this.newTaskStore.dto = new this.newTaskStore.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {
      let recentTasksSummary = this.newTaskStore.dto;

      let activeTask = recentTasksSummary.activeTask;
      if (activeTask) {
        let recentEntry = {
          projectId : activeTask.projectId,
          taskId : activeTask.id,
          description: activeTask.summary
        };

        this.setState({
           recentEntry: recentEntry,
           recentTasksByProjectId: recentTasksSummary.recentTasksByProjectId
        })
      }

      this.log("Success!!");
    }
  };
  onSaveEntryCb = (err) => {
    this.log("Journal Layout : onSaveEntryCb saving!");
    if (err) {
      this.newJournalEntryStore.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {
      let savedEntry = this.newJournalEntryStore.dto;
      this.log(JSON.stringify(savedEntry, null, 2));

      let recentEntry = {
          projectId : savedEntry.projectId,
          taskId : savedEntry.taskId,
          description: savedEntry.description
        };

      //create journal item from saved entry
      //set the active journal item and active index

      let journalItem = this.createJournalItem(this.state.allJournalItems.length, savedEntry);

      if (this.state.allJournalItems.length > 0) {
        let lastItem = this.state.allJournalItems[this.state.allJournalItems.length - 1];
        if (!lastItem.finishStatus) {
          lastItem.finishStatus = "done";
        }
      }

      this.setState({
        allJournalItems: [...this.state.allJournalItems,journalItem],
        activeJournalItem: journalItem,
        activeIndex: journalItem.index,
        recentEntry: recentEntry,
        activeSize: this.state.allJournalItems.length + 1
      });

      this.props.onFlameChange(0);

      this.log("Updating recent tasks!!");
      this.recentTasksStore.load(null,
        err => {
          setTimeout(() => {
            this.onUpdateRecentTaskCb(err);
          }, this.activateWaitDelay);
        });

      this.props.onXP();


      this.log("Success!!");
    }
  };

  onStoreLoadCb = (err) => {
    this.log("Journal Layout : onStoreLoadCb");
    if (err) {
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let recentJournalDto = this.store.dto;

      let recentEntry = {};

      if (recentJournalDto.recentIntentions.length > 0) {
         let latestIntention = recentJournalDto.recentIntentions[recentJournalDto.recentIntentions.length - 1];

         recentEntry = {
           projectId : latestIntention.projectId,
           taskId : latestIntention.taskId,
           description: latestIntention.description
         };
      }

      var journalItems = [];
      var intentions = recentJournalDto.recentIntentions;

      for (var i in intentions) {
        journalItems[i] = this.createJournalItem(i, intentions[i]);
      }

      let activeJournalItem = null;
      let activeIndex = 0;

      if (journalItems.length > 0) {
        activeJournalItem = journalItems[journalItems.length - 1];
        activeIndex = activeJournalItem.index;
      }

      this.setState({
        allJournalItems: journalItems,
        activeJournalItem: activeJournalItem,
        activeIndex: activeIndex,
        recentProjects: recentJournalDto.recentProjects,
        recentTasksByProjectId: recentJournalDto.recentTasksByProjectId,
        recentEntry: recentEntry,
        intentions: recentJournalDto.recentIntentions,
        activeSize: recentJournalDto.recentIntentions.length
      });

      if (activeJournalItem) {
        this.props.onFlameChange(activeJournalItem.flameRating);
      }

      this.log("Success!");
    }
  };

  createJournalItem = (index, intention) => {

    let d = intention.position;
    let dateObj = new Date(d[0], d[1]-1, d[2], d[3], d[4], d[5]);

    return {
      index: index,
      id: intention.id,
      flameRating: intention.flameRating,
      projectName: intention.projectName,
      taskName: intention.taskName,
      taskSummary: intention.taskSummary,
      description: intention.description,
      finishStatus: intention.finishStatus,
      position: moment(dateObj).format("ddd, MMM Do 'YY, h:mm a"),
      rawDate: dateObj
    };
  };

  onChangeActiveEntry = (rowId, journalItem) => {
    this.log("onChangeActiveEntry:" + rowId + ", "+ journalItem.index);

    this.setState({
       activeIndex: journalItem.index,
      activeJournalItem: journalItem,
      updatedFlame: journalItem.flameRating
    });

    this.props.onFlameChange(journalItem.flameRating);
    this.props.onChangeActiveDate(journalItem.rawDate);

  };

  // onChangeScrubPosition = (selectedIndex) => {
  //   this.log("onChangeScrubPosition:" + selectedIndex);
  //   this.setState({
  //     activeIndex: selectedIndex,
  //     activeJournalItem: this.state.allJournalItems[selectedIndex]
  //   });
  //   this.props.onFlameChange(this.state.allJournalItems[selectedIndex].flameRating);
  // };

  /// renders the journal layout of the console view
  render() {
    return (
      <div id="component" className="journalLayout">
        <div id="wrapper" className="journalItems">
          <JournalItems onChangeActiveEntry={this.onChangeActiveEntry} onFlameUpdate={this.onSaveFlameUpdates} onFinishEntry={this.onFinishEntry}
                        updatedFlame={this.state.updatedFlame} onAdjustFlame={this.props.onAdjustFlame}
                        activeIndex={this.state.activeIndex} allJournalItems={this.state.allJournalItems} height={this.calculateJournalItemsHeight()} />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry consoleIsCollapsed={this.props.consoleIsCollapsed} onAddEntry={this.onAddEntry} onAddTask={this.onAddTask} recentEntry={this.state.recentEntry} recentProjects={this.state.recentProjects} recentTasksByProjectId={this.state.recentTasksByProjectId}/>
        </div>
      </div>
    );
  }
}
