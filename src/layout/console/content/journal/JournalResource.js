import React, { Component } from "react";
import JournalEntry from "./components/JournalEntry";
import { DimensionController } from "../../../../controllers/DimensionController";
import { Grid } from "semantic-ui-react";
import JournalItem from "./components/JournalItem";
import { JournalClient } from "../../../../clients/JournalClient";

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
    this.resource = props.resource;
    this.journalItems = [];
    this.activeJournalItem = null;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    let userName = nextProps.resource.uriArr[1];
    JournalClient.getRecentIntentions(userName, this, arg => {
      console.log(arg);
      this.journalItems = arg.data;
      this.forceUpdate();
    });
    return false;
  }

  componentDidMount() {
    JournalClient.getRecentIntentions("me", this, arg => {
      console.log(arg);
      this.journalItems = arg.data;
      this.forceUpdate();
    });
  }

  /**
   * called when we finish creating a new intention from the journal entry
   * @param journalEntry
   * @param finishStatus
   */
  onFinishEntry = (journalEntry, finishStatus) => {
    // TODO  save our journal entry
  };

  /**
   * called when the active selected item changes
   * @param rowId
   * @param journalItem
   */
  onChangeActiveEntry = (rowId, journalItem) => {
    // TODO do some stuff to update to the active journal item
  };

  /**
   * callback listener for the AddTask event which creates  new journal entry
   * @param projectId - the id of the project the task will be added to
   * @param taskName - the name of the task to be entered into the journal
   */
  onAddTask = (projectId, taskName) => {
    // creates a new task for our drop down
  };

  scrollToBottomOrActive = () => {
    if (this.activeJournalItem) {
      let activeRowId = this.activeJournalItem.id;

      let rowObj = document.getElementById(activeRowId);

      if (
        rowObj &&
        (this.isFirstActive() || !this.isElementInViewport(rowObj))
      ) {
        rowObj.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (this.isLastActive()) {
      this.elEnd.scrollIntoView({ behavior: "smooth" });
    }
  };

  isFirstActive() {
    let activeIndex = 0;

    if (this.activeJournalItem) {
      activeIndex = this.activeJournalItem.index;
    }

    return activeIndex === 0;
  }

  isLastActive() {
    let activeIndex = 0;

    if (this.activeJournalItem) {
      activeIndex = this.activeJournalItem.index;
    }

    return activeIndex === this.journalItems.length - 1;
  }

  isElementInViewport = el => {
    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight ||
          document.documentElement.clientHeight) /*or $(window).height() */ &&
      rect.right <=
        (window.innerWidth ||
          document.documentElement.clientWidth) /*or $(window).width() */
    );
  };

  onSetActiveRow = (rowId, rowObj, journalItem) => {
    // TODO set the active row
  };

  isActive(id) {
    if (this.activeJournalItem) {
      return this.activeJournalItem.id === id;
    } else {
      return false;
    }
  }

  getEffectiveDirtyFlame(id) {
    // TODO how dirty is our flame? We just don't know for sure.
    return null;
  }

  getJournalItems() {
    return this.journalItems.map(item => {
      return (
        <JournalItem
          key={item.id}
          id={item.id}
          isActive={this.isActive(item.id)}
          dirtyFlame={this.getEffectiveDirtyFlame(item.id)}
          linked={item.linked}
          projectName={item.projectName}
          taskName={item.taskName}
          taskSummary={item.taskSummary}
          description={item.description}
          flameRating={item.flameRating}
          finishStatus={item.finishStatus}
          journalEntryType={item.journalEntryType}
          circleId={item.circleId}
          position={item.position}
          journalItem={item}
          onSetActiveRow={this.onSetActiveRow}
          onUpdateFinishStatus={this.onUpdateFinishStatus}
        />
      );
    });
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - returns the JSX for this component
   */
  render() {
    console.log("render");
    return (
      <div id="component" className="journalLayout">
        <div id="wrapper" className="journalItems">
          <div
            id="component"
            className="journalItems"
            style={{
              height: DimensionController.getHeightFor(
                DimensionController.Components.JOURNAL_ITEMS
              )
            }}
          >
            <Grid inverted>{this.getJournalItems()}</Grid>
            <div
              className="fltLftClrBth"
              ref={el => {
                this.elEnd = el;
              }}
            />
          </div>
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry onAddTask={this.onAddTask} />
        </div>
      </div>
    );
  }
}
