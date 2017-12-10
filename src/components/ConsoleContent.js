import React, { Component } from "react";
import Journal from "./Journal";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
  }

  /*
   * renders the tab component of the console view
   */
  render() {
    return (
      <div id="component" className="consoleContent">
        <div id="wrapper" className="journal">
          <Journal />
        </div>
      </div>
    );
  }
}
