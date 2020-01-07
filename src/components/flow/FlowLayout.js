import React, { Component } from "react";
import FlowContent from "./FlowContent";

/**
 * this component is the tab panel wrapper for the flow content
 * @author ZoeDreams
 * @copyright DreamScale, Inc. 2020©®™√
 */
export default class FlowLayout extends Component {
  /**
   * builds the flow layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowLayout]";
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    return (
      <div id="component" className="flowLayout">
        <div id="wrapper" className="flowContent">
          <FlowContent />
        </div>
      </div>
    );
  }
}
