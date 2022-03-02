import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
import {ChartClient} from "../../../../../clients/ChartClient";
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
    this.state = {
      tableDto: null
    }
  }

  displayChart() {
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
    ChartClient.chartTopBoxes(
      "gt[*]",
      this,
      (arg) => {
        console.log("chart boxes returnedx!");
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            tableDto: arg.data
          });
        }
      }
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.tableDto && this.state.tableDto) {
      this.displayChart();
    }
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      <div
        id="component"
        className="dashboardContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.FLOW_PANEL
          ),
        }}
      >
       <div id="chart" />
      </div>
    );
  }
}
