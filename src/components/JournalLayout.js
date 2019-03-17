import React, { Component } from "react";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";
import { DataModelFactory } from "../models/DataModelFactory";
import { JournalModel } from "../models/JournalModel";
import {ActiveViewControllerFactory} from "../perspective/ActiveViewControllerFactory";

//
// this component is the tab panel wrapper for the console content
//
export default class JournalLayout extends Component {
  constructor(props) {
    super(props);

    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );

    this.consoleController = ActiveViewControllerFactory.createViewController(ActiveViewControllerFactory.Views.CONSOLE_PANEL, this);

  }

  resetCb() {
    if (this.consoleController.consoleIsCollapsed) {
      console.log("RESET JOURNAL ITEM!!!");
      setTimeout(() => {
        this.journalModel.resetActiveToLastJournalItem();
      }, 200);
    }
  }

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


  componentDidMount = () => {
    console.log("Journal Layout : componentDidMount");

    this.consoleController.configureJournalLayoutListener(this, this.resetCb);

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
      console.log("Rerfresh from existing journal");
      this.onJournalRecentTasksUpdateCb();
      this.onJournalHistoryUpdateCb();
    }
  };

  componentWillUnmount = () => {
    console.log("Journal Layout : componentWillUnmount");

    this.journalModel.unregisterAllListeners("journalLayout");
    this.teamModel.unregisterAllListeners("journalLayout");
    this.activeCircleModel.unregisterAllListeners("journalLayout");
    this.consoleController.configureJournalLayoutListener(this, null);
  };

  onJournalRecentTasksUpdateCb = () => {
    console.log("Journal Layout : onJournalRecentTasksUpdateCb");

    console.log("recent projects: "+this.journalModel.getActiveScope().recentProjects);

    this.setState({
      recentProjects: this.journalModel.getActiveScope().recentProjects,
      recentTasksByProjectId: this.journalModel.getActiveScope()
        .recentTasksByProjectId,
      recentEntry: this.journalModel.getActiveScope().recentEntry
    });
  };

  onJournalHistoryUpdateCb = () => {
    console.log("Journal Layout : onJournalHistoryUpdateCb");
    this.setState({
      allJournalItems: this.journalModel.getActiveScope().allJournalItems,
      activeSize: this.journalModel.getActiveScope().activeSize,
      activeJournalItem: this.journalModel.getActiveScope().activeJournalItem,
      activeIndex: this.journalModel.getActiveScope().activeIndex,
      activeFlame: this.journalModel.getActiveScope().activeFlame
    });

  };

  onJournalActiveItemUpdateCb = () => {
    console.log("Journal Layout : onJournalActiveItemUpdateCb");
    this.setState({
      activeJournalItem: this.journalModel.getActiveScope().activeJournalItem,
      activeIndex: this.journalModel.getActiveScope().activeIndex,
      activeFlame: this.journalModel.getActiveScope().activeFlame
    });
  };

  onFinishEntry = (journalEntry, finishStatus) => {
    console.log("Journal Layout : onFinishEntry");

    this.journalModel.finishIntention(journalEntry.id, finishStatus);
  };

  onChangeActiveEntry = (rowId, journalItem) => {
    console.log("onChangeActiveEntry:" + rowId + ", " + journalItem.index);

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
            height={this.calculateJournalItemsHeight()}
          />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry
            onAddTask={this.onAddTask}
          />
        </div>
      </div>
    );
  }
}
