import React, { Component } from "react";
import JournalLayout from "./JournalLayout";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
  }

  /// renders the content of the console view
  render() {
    return (
      <div id="component" className="consoleContent">
        <div id="wrapper" className="journalLayout">
          <JournalLayout />
        </div>
      </div>
    );
  }
}
