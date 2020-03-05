import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";

/**
 * this component is the tab panel wrapper for the terminal content
 * @author ZoeDreams
 * @copyright DreamScale, Inc. 2020©®™√
 */
export default class TerminalContent extends Component {
  /**
   * builds the Terminal Content component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TerminalContent]";
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      <div
        id="component"
        className="terminalContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.FLOW_PANEL
          )
        }}
      >
        [ Terminal Content ]
      </div>
    );
  }
}
