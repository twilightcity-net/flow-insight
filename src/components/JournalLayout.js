import React, { Component } from "react";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";
import { DataModelFactory } from "../models/DataModelFactory";
import { JournalModel } from "../models/JournalModel";

const { remote } = window.require("electron");

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

    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );
  }

  componentWillReceiveProps = nextProps => {
    if (this.lastOpenCloseState === 1 && nextProps.consoleIsCollapsed === 0) {
      //if it's now open, and used to be closed, need to reset the window
      this.journalModel.resetActiveToLastJournalItem();
    }

    this.lastOpenCloseState = nextProps.consoleIsCollapsed;
  };

  /// performs a simple calculation for dynamic height of items, this
  /// is becuase there will be a slight variation in the screen height
  calculateJournalItemsHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
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
      heights.journalEntry
    );
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("Journal Layout : componentDidMount");

    this.journalModel.registerListener(
      "journalLayout",
      JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE,
      this.onJournalHistoryUpdateCb
    );
    this.journalModel.registerListener(
      "journalLayout",
      JournalModel.CallbackEvent.RECENT_TASKS_UPDATE,
      this.onJournalRecentTasksUpdateCb
    );
    this.journalModel.registerListener(
      "journalLayout",
      JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE,
      this.onJournalActiveItemUpdateCb
    );

    if (this.journalModel.isNeverLoaded()) {
      this.journalModel.loadDefaultJournal();
    } else {
      this.onJournalRecentTasksUpdateCb();
      this.onJournalHistoryUpdateCb();
    }
  };

  componentWillUnmount = () => {
    this.log("Journal Layout : componentWillUnmount");

    this.journalModel.unregisterAllListeners("journalLayout");
  };

  onJournalRecentTasksUpdateCb = () => {
    this.setState({
      recentProjects: this.journalModel.recentProjects,
      recentTasksByProjectId: this.journalModel.recentTasksByProjectId,
      recentEntry: this.journalModel.recentEntry
    });
  };

  onJournalHistoryUpdateCb = () => {
    this.setState({
      allJournalItems: this.journalModel.allJournalItems,
      activeSize: this.journalModel.activeSize,
      activeJournalItem: this.journalModel.activeJournalItem,
      activeIndex: this.journalModel.activeIndex,
      activeFlame: this.journalModel.activeFlame
    });

    this.spiritModel.refreshXP();
    this.spiritModel.resetFlame(this.journalModel.activeFlame);
    this.teamModel.refreshMe();
  };

  onJournalActiveItemUpdateCb = () => {
    this.setState({
      activeJournalItem: this.journalModel.activeJournalItem,
      activeIndex: this.journalModel.activeIndex,
      activeFlame: this.journalModel.activeFlame
    });

    this.spiritModel.resetFlame(
      this.journalModel.activeJournalItem.flameRating
    );
  };

  onFinishEntry = (journalEntry, finishStatus) => {
    this.log("Journal Layout : onFinishEntry");

    this.journalModel.finishIntention(journalEntry.id, finishStatus);
  };

  onChangeActiveEntry = (rowId, journalItem) => {
    this.log("onChangeActiveEntry:" + rowId + ", " + journalItem.index);

    this.journalModel.setActiveJournalItem(journalItem);
  };

  onAddTask = (projectId, taskName) => {
    console.log("Journal Layout : onAddTask: " + projectId + ", " + taskName);

    this.journalModel.addTaskRef(taskName);
  };

  /// renders the journal layout of the console view
  render() {
    return (
      <div id="component" className="journalLayout">
        <div id="wrapper" className="journalItems">
          <JournalItems
            onChangeActiveEntry={this.onChangeActiveEntry}
            onFinishEntry={this.onFinishEntry}
            activeIndex={this.state.activeIndex}
            allJournalItems={this.state.allJournalItems}
            height={this.calculateJournalItemsHeight()}
          />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry
            consoleIsCollapsed={this.props.consoleIsCollapsed}
            onAddTask={this.onAddTask}
            recentEntry={this.state.recentEntry}
            recentProjects={this.state.recentProjects}
            recentTasksByProjectId={this.state.recentTasksByProjectId}
          />
        </div>
      </div>
    );
  }
}
