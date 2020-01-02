import React, { Component } from "react";
import BrowserHeader from "../browser/BrowserHeader";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";
import { DataModelFactory } from "../../models/DataModelFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalLayout extends Component {
  constructor(props) {
    super(props);
    this.name = "[JournalLayout]";
    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS
    );
  }

  onFinishEntry = (journalEntry, finishStatus) => {
    console.log(
      this.name +
        " finished journal entry status : " +
        journalEntry.id +
        " -> " +
        finishStatus
    );
    this.journalModel.finishIntention(journalEntry.id, finishStatus);
  };

  onChangeActiveEntry = (rowId, journalItem) => {
    console.log(
      this.name +
        " - journal entry changed :" +
        rowId +
        " -> " +
        journalItem.index
    );
    this.journalModel.setActiveJournalItem(journalItem);
  };

  /**
   * callback listener for the AddTask event which creates  new journal entry
   * @param projectId - the id of the project the task will be added to
   * @param taskName - the name of the task to be entered into the journal
   */
  onAddTask = (projectId, taskName) => {
    console.log(this.name + " - onAddTask: " + projectId + ", " + taskName);

    this.journalModel.addTaskRef(taskName);
  };

  getBrowserHeader = (scope, member) => {
    return (
      <div id="wrapper" className="browserHeader">
        <BrowserHeader
          scope={scope}
          member={member}
          location={"/Journal/" + member}
        />
      </div>
    );
  };

  /**
   * renders the journal layout of the console view
   * @returns {*} - returns the JSX for this component
   */
  render() {
    return (
      <div id="component" className="journalLayout">
        {this.getBrowserHeader(
          this,
          this.teamModel.getActiveTeamMemberShortName()
        )}
        <div id="wrapper" className="journalItems">
          <JournalItems
            onChangeActiveEntry={this.onChangeActiveEntry}
            onFinishEntry={this.onFinishEntry}
          />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry onAddTask={this.onAddTask} />
        </div>
      </div>
    );
  }
}
