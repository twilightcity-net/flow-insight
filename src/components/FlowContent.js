import React, { Component } from "react";
import { DimensionController } from "../perspective/DimensionController";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class FlowContent extends Component {
  /**
   * the constructor function which builds the FlowContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FlowContent.name + "]";
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      <div
        id="component"
        className="flowContent"
        style={{ height: DimensionController.getHeightFor(this) }}
      >
        <i>Sorry, no flow data to display rn.</i>
      </div>
    );
  }
}
