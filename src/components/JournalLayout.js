import React, { Component } from "react";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";
import { DataModelFactory } from "../models/DataModelFactory";

//
// this component is the tab panel wrapper for the console content
//
export default class JournalLayout extends Component {
  constructor(props) {
    super(props);

    this.name = "[JournalLayout]";

    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );
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

  onFinishEntry = (journalEntry, finishStatus) => {
    console.log(this.name + " - onFinishEntry");

    this.journalModel.finishIntention(journalEntry.id, finishStatus);
  };

  onChangeActiveEntry = (rowId, journalItem) => {
    console.log(
      this.name + " - onChangeActiveEntry:" + rowId + ", " + journalItem.index
    );

    this.journalModel.setActiveJournalItem(journalItem);
  };

  onAddTask = (projectId, taskName) => {
    console.log(this.name + " - onAddTask: " + projectId + ", " + taskName);

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
          <JournalEntry onAddTask={this.onAddTask} />
        </div>
      </div>
    );
  }
}
