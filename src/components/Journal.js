import React, { Component } from "react";
import TimeScrubber from "./TimeScrubber";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class Journal extends Component {
  constructor(props) {
    super(props);
  }

  /*
   * renders the tab component of the console view
   */
  render() {
    return (
      <div id="component" className="journal">
        <div id="wrapper" className="timeScrubber">
          <TimeScrubber />
        </div>
        <div id="wrapper" className="journalItems">
          <JournalItems />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry />
        </div>
      </div>
    );
  }
}
