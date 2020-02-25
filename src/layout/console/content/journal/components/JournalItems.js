import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import JournalItem from "./JournalItem";
import { DimensionController } from "../../../../../controllers/DimensionController";
// import { JournalClient } from "../../../../../clients/JournalClient";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalItems extends Component {
  constructor(props) {
    super(props);
    this.name = "[JournalItems]";
    this.state = {
      resource: props.resource,
      journalItems: props.journalItems,
      activeJournalItem: null
    };
    // JournalClient.getRecentIntentions(nextProps.resource.uriArr[1], this, arg => {
    //   console.log(arg);
    //   this.journalItems = arg.data;
    //   this.forceUpdate();
    // })
  }

  componentDidUpdate() {
    this.scrollToBottomOrActive();
  }

  scrollToBottomOrActive = () => {
    if (this.state.activeJournalItem) {
      let activeRowId = this.state.activeJournalItem.id;

      let rowObj = document.getElementById(activeRowId);

      if (
        rowObj &&
        (this.isFirstActive() || !this.isElementInViewport(rowObj))
      ) {
        rowObj.scrollIntoView({ behavior: "smooth" });
      }
    }

    if (this.isLastActive()) {
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  };

  isFirstActive() {
    let activeIndex = 0;

    if (this.state.activeJournalItem) {
      activeIndex = this.state.activeJournalItem.index;
    }

    return activeIndex === 0;
  }

  isLastActive() {
    let activeIndex = 0;

    if (this.state.activeJournalItem) {
      activeIndex = this.state.activeJournalItem.index;
    }

    return activeIndex === this.state.journalItems.length - 1;
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
    this.journalModel.setActiveJournalItem(journalItem);
  };

  onUpdateFinishStatus = (journalItem, newStatus) => {
    console.log(this.name + " - onUpdateFinishStatus");
    this.props.onFinishEntry(journalItem, newStatus);
  };

  isActive(id) {
    if (this.state.activeJournalItem) {
      return this.state.activeJournalItem.id === id;
    } else {
      return false;
    }
  }

  getEffectiveDirtyFlame(id) {
    let dirtyFlame = null;
    if (this.isActive(id)) {
      dirtyFlame = this.spiritModel.dirtyFlame;
    }

    return dirtyFlame;
  }

  getJournalItems() {
    return this.state.journalItems.map(d => {
      return (
        <JournalItem
          key={d.id}
          id={d.id}
          isActive={this.isActive(d.id)}
          dirtyFlame={this.getEffectiveDirtyFlame(d.id)}
          linked={d.linked}
          projectName={d.projectName}
          taskName={d.taskName}
          taskSummary={d.taskSummary}
          description={d.description}
          flameRating={d.flameRating}
          finishStatus={d.finishStatus}
          journalEntryType={d.journalEntryType}
          circleId={d.circleId}
          position={d.position}
          journalItem={d}
          onSetActiveRow={this.onSetActiveRow}
          onUpdateFinishStatus={this.onUpdateFinishStatus}
        />
      );
    });
  }

  /// renders the journal items component from array in the console view
  render() {
    return (
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
          style={{ float: "left", clear: "both" }}
          ref={el => {
            this.messagesEnd = el;
          }}
        />
      </div>
    );
  }
}
