import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import JournalItem from "./JournalItem";

const {remote} = window.require("electron");

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

    document.onkeydown = this.handleKeyPress;

  }


  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentWillReceiveProps = (nextProps) => {
    this.log("JournalItems:: componentWillReceiveProps");

    let activeJournalItem = null;

    if (nextProps.allJournalItems.length > 0) {
      activeJournalItem = nextProps.allJournalItems[nextProps.activeIndex];
      if (!activeJournalItem.flameRating) {
        activeJournalItem.flameRating = 0;
      }

      if ( activeJournalItem.flameRating !== nextProps.updatedFlame) {
        activeJournalItem.flameRating = nextProps.updatedFlame;
        this.saveDirtyFlames(this.props, activeJournalItem);
      }

    }

    this.clearActiveRows();

    this.setState({
      journalItems: nextProps.allJournalItems,
      activeJournalItem: activeJournalItem
    });

  };


  saveDirtyFlames = (props, journalItemWithFlameUpdates) => {

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(function() {
      electronLog.info("saveDirtyFlames!!!!!");
      props.onFlameUpdate(journalItemWithFlameUpdates);
    }, 500);

  };


  scrollToBottomOrActive = () => {
    if (this.state.activeJournalItem) {
      let activeRowId = this.state.activeJournalItem.id;

      let rowObj = document.getElementById(activeRowId);

      if (rowObj && (this.isFirstActive() || !this.isElementInViewport(rowObj))) {
        rowObj.scrollIntoView({behavior: "smooth"});
      }
    }

    if (this.isLastActive()) {
      this.log("isLastActive");
      this.messagesEnd.scrollIntoView({behavior: "smooth"});
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

    this.log("activeIndex: "+activeIndex);
    this.log("journalItemSize: "+this.state.journalItems.length);

    return activeIndex === (this.state.journalItems.length - 1);

  }

  isElementInViewport = (el) => {

      var rect = el.getBoundingClientRect();

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
      );
    };

  componentDidMount() {
    this.log("componentDidMount");
    this.scrollToBottomOrActive();

  }

  componentDidUpdate() {
    this.log("componentDidUpdate");

    this.updateActiveRow();
    this.scrollToBottomOrActive();
  }

  updateActiveRow = () => {

    this.clearActiveRows();
    if (this.state.activeJournalItem) {

      let activeRowId = this.state.activeJournalItem.id;

      let rowObj = document.getElementById(activeRowId);

      if (rowObj) {
        rowObj.classList.add("active");
      }
    }
  };


  onSetActiveRow = (rowId, rowObj, journalItem) => {
    this.log("setActiveRow");

    this.clearActiveRows();

    rowObj.classList.add("active");

    this.setState({
      activeJournalItem: journalItem
    });

    this.props.onChangeActiveEntry(rowId, journalItem);
  };

  onUpdateFinishStatus = (journalItem, newStatus) => {
    this.log("onUpdateFinishStatus");
    this.props.onFinishEntry(journalItem, newStatus);
  };

  clearActiveRows = () => {
    if (this.state.activeJournalItem) {
      let rowObj = document.getElementById(this.state.activeJournalItem.id);
      rowObj.classList.remove("active");
    }
  };

  handleKeyPress = e => {
    this.log("key!!");
    if (e.keyCode === 37) {
      this.log("left");
      this.props.onAdjustFlame(-1);
    }
    if (e.keyCode === 38) {
      this.log("up");
      this.changeRowIndex('up');
      e.preventDefault();
    }
    if (e.keyCode === 39) {
      this.log("right");
      this.props.onAdjustFlame(1);
    }
    if (e.keyCode === 40) {
      this.log("down");
      this.changeRowIndex('down');
      e.preventDefault();
    }
  };

  changeRowIndex = (direction) => {

    if (this.state.activeJournalItem) {

      let newIndex = this.state.activeJournalItem.index;
      if (direction === 'up') {
        newIndex = newIndex - 1;
      } else if (direction === 'down') {
        newIndex = new Number(newIndex) + 1;
      }

      if (newIndex < 0) {
        newIndex = 0;
      }

      this.log("old index ="+newIndex);

      if (newIndex > this.state.journalItems.length - 1) {
        newIndex = this.state.journalItems.length - 1;
      }

      this.log("new index ="+newIndex);

      let newActiveItem = this.state.journalItems[newIndex];
      let rowObj = document.getElementById(newActiveItem.id);
      this.onSetActiveRow(newActiveItem.id, rowObj, newActiveItem);

    }

  };

  /// renders the journal items component from array in the console view
  render() {
    return (
      <div
        id="component"
        className="journalItems"
        style={{height: this.props.height}}
      >
        <Grid inverted onKeyPress={this.handleKeyPress}>
          {this.state.journalItems.map(d =>
            <JournalItem
              key={d.id}
              id={d.id}
              projectName={d.projectName}
              taskName={d.taskName}
              taskSummary={d.taskSummary}
              description={d.description}
              flameRating={d.flameRating}
              finishStatus={d.finishStatus}
              position={d.position}
              journalItem={d}
              onSetActiveRow={this.onSetActiveRow}
              onUpdateFinishStatus={this.onUpdateFinishStatus}
            />
          )}
        </Grid>
        <div style={{float: "left", clear: "both"}}
             ref={(el) => {
               this.messagesEnd = el;
             }}>
        </div>
      </div>
    );
  }
}

