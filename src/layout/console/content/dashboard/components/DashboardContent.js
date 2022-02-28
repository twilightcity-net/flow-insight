import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
/**
 * this component is the tab panel wrapper for the console content
 */
export default class DashboardContent extends Component {
  /**
   * the constructor function which builds the DashboardContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + DashboardContent.name + "]";
  }

  showChart() {
    let height =
      DimensionController.getFullRightPanelHeight();
    let width =
      DimensionController.getFullRightPanelWidth();

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + "px")
      .attr("height", height + "px");
  }

  componentDidMount() {
    this.showChart();
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
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.FLOW_PANEL
          ),
        }}
      >
        <div id="chart"></div>
      </div>
    );
  }
}
