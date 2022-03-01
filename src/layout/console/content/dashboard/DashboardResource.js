import React, { Component } from "react";
import DashboardContent from "./components/DashboardContent";
import {DimensionController} from "../../../../controllers/DimensionController";
import FlowContent from "../flow/components/FlowContent";

/**
 * this component is the tab panel wrapper for dashboard content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class DashboardResource extends Component {
  /**
   * builds the chart layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[DashboardResource]";
    this.state = {
      resource: props.resource,
    };
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.FLOW_PANEL
    );

    return (
      <div
        id="component"
        className="dashboardLayout"
        style={{ height: height }}
      >
        <div id="wrapper" className="dashboardContent">
          <DashboardContent />
        </div>
      </div>
    );
  }
}
