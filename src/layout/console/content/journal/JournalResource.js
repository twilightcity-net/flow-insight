import React, { Component } from "react";
import JournalItems from "./components/JournalItems";
import JournalEntry from "./components/JournalEntry";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalResource extends Component {
  /**
   * builds the basic journal layout component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[JournalResource]";
    this.journalItems = [];
    this.state = {
      resource: props.resource
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(this.state.resource);
  }

  /**
   * called when we finish creating a new intention from the journal entry
   * @param journalEntry
   * @param finishStatus
   */
  onFinishEntry = (journalEntry, finishStatus) => {
    // this.journalModel.finishIntention(journalEntry.id, finishStatus);
  };

  /**
   * called when the active selected item changes
   * @param rowId
   * @param journalItem
   */
  onChangeActiveEntry = (rowId, journalItem) => {
    // this.journalModel.setActiveJournalItem(journalItem);
  };

  /**
   * callback listener for the AddTask event which creates  new journal entry
   * @param projectId - the id of the project the task will be added to
   * @param taskName - the name of the task to be entered into the journal
   */
  onAddTask = (projectId, taskName) => {
    // this.journalModel.addTaskRef(taskName);
  };

  /**
   * renders the journal layout of the console view
   * @returns {*} - returns the JSX for this component
   */
  render() {
    return (
      <div id="component" className="journalLayout">
        <div id="wrapper" className="journalItems">
          <JournalItems
            resource={this.state.resource}
            journalItems={this.journalItems}
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
