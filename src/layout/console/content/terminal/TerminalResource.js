import React, { Component } from "react";
import TerminalContent from "./components/TerminalContent";

/**
 * this component is the tab panel wrapper for the terminal resource
 * @author ZoeDreams
 * @copyright DreamScale, Inc. 2020©®™√
 */
export default class TerminalResource extends Component {
  /**
   * builds the terminal layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TerminalResource]";
    this.state = {
      resource: props.resource
    };
  }

  componentDidMount() {}

  /**
   * renders the terminal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    return (
      <div id="component" className="terminalLayout">
        <div id="wrapper" className="terminalContent">
          <TerminalContent />
        </div>
      </div>
    );
  }
}
