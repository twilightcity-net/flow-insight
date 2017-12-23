import React, { Component } from "react";
import TimeScrubber from "./TimeScrubber";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";

//
// this component is the tab panel wrapper for the console content
//
export default class JournalLayout extends Component {
  constructor(props) {
    super(props);
    this.bounds = this.getBounds();
    console.log(this.bounds);
  }

  getBounds() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  calculateJournalItemsHeight() {
    let heights = {
      bottomMargin: 5,
      consoleMenu: 40,
      contentMargin: 16,
      contentPadding: 8,
      timeScrubber: 52,
      journalEntry: 48,
      journalItems: 0
    };

    heights.journalItems =
      this.bounds.height -
      heights.bottomMargin -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.timeScrubber -
      heights.journalEntry;

    console.log(heights.journalItems);
    return heights.journalItems;
  }

  /// renders the tab component of the console view
  render() {
    return (
      <div id="component" className="journalLayout">
        <div id="wrapper" className="timeScrubber">
          <TimeScrubber />
        </div>
        <div id="wrapper" className="journalItems">
          <JournalItems height={this.calculateJournalItemsHeight()} />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry />
        </div>
      </div>
    );
  }
}
