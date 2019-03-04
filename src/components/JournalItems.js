import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import JournalItem from "./JournalItem";
import { DataModelFactory } from "../models/DataModelFactory";
import { SpiritModel } from "../models/SpiritModel";

const { remote } = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the tab panel wrapper for the console content
//
export default class JournalItems extends Component {
  constructor(props) {
    super(props);

    this.state = {
      journalItems: [],
      activeJournalItem: null
    };

    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );

    document.onkeydown = this.handleKeyPress;
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount() {
    this.log("JournalItems : componentDidMount");

    this.spiritModel.registerListener(
      "journalItems",
      SpiritModel.CallbackEvent.DIRTY_FLAME_UPDATE,
      this.onDirtyFlameUpdate
    );

    this.scrollToBottomOrActive();
  }

  componentWillUnmount() {
    this.log("JournalItems : componentWillUnmount");

    this.spiritModel.unregisterAllListeners("journalItems");
  }

  componentWillReceiveProps = nextProps => {
    this.log("JournalItems:: componentWillReceiveProps");

    let activeJournalItem = null;

    if (nextProps.allJournalItems.length > 0) {
      activeJournalItem = nextProps.allJournalItems[nextProps.activeIndex];
      if (!activeJournalItem.flameRating) {
        activeJournalItem.flameRating = 0;
      }
    }

    this.setState({
      journalItems: nextProps.allJournalItems,
      activeJournalItem: activeJournalItem
    });
  };

  onDirtyFlameUpdate = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    let journalModel = this.journalModel;
    let spiritModel = this.spiritModel;

    let activeJournalItem = journalModel.activeJournalItem;

    this.timeout = setTimeout(function() {
      console.log("saveDirtyFlames!!!!!");

      journalModel.updateFlameRating(activeJournalItem, spiritModel.dirtyFlame);
    }, 500);
  };

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
      this.log("isLastActive");
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

    this.log("activeIndex: " + activeIndex);
    this.log("journalItemSize: " + this.state.journalItems.length);

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

  componentDidUpdate() {
    this.log("componentDidUpdate");

    this.scrollToBottomOrActive();
  }

  onSetActiveRow = (rowId, rowObj, journalItem) => {
    this.journalModel.setActiveJournalItem(journalItem);
  };

  onUpdateFinishStatus = (journalItem, newStatus) => {
    this.log("onUpdateFinishStatus");
    this.props.onFinishEntry(journalItem, newStatus);
  };

  handleKeyPress = e => {
    this.log("key!!");
    if (e.keyCode === 37) {
      this.log("left");
      this.spiritModel.adjustFlame(-1);
    }
    if (e.keyCode === 38) {
      this.log("up");
      this.changeRowIndex("up");
      e.preventDefault();
    }
    if (e.keyCode === 39) {
      this.log("right");
      this.spiritModel.adjustFlame(1);
    }
    if (e.keyCode === 40) {
      this.log("down");
      this.changeRowIndex("down");
      e.preventDefault();
    }
  };

  changeRowIndex = direction => {
    if (this.state.activeJournalItem) {
      let newIndex = this.state.activeJournalItem.index;
      this.log("old index =" + newIndex);

      if (direction === "up") {
        newIndex = newIndex - 1;
      } else if (direction === "down") {
        newIndex = Number(newIndex) + 1;
      }

      if (newIndex < 0) {
        newIndex = 0;
      }

      if (newIndex > this.state.journalItems.length - 1) {
        newIndex = this.state.journalItems.length - 1;
      }

      this.log("new index =" + newIndex);

      let newActiveItem = this.state.journalItems[newIndex];
      let rowObj = document.getElementById(newActiveItem.id);
      this.onSetActiveRow(newActiveItem.id, rowObj, newActiveItem);
    }
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

  /// renders the journal items component from array in the console view
  render() {
    return (
      <div
        id="component"
        className="journalItems"
        style={{ height: this.props.height }}
      >
        <Grid inverted onKeyPress={this.handleKeyPress}>
          {this.state.journalItems.map(d => (
            <JournalItem
              key={d.id}
              id={d.id}
              isActive={this.isActive(d.id)}
              dirtyFlame={this.getEffectiveDirtyFlame(d.id)}
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
          ))}
        </Grid>
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
