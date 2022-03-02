import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
import {ChartClient} from "../../../../../clients/ChartClient";
import UtilRenderer from "../../../../../UtilRenderer";
import FrictionBoxBubbleChart from "./FrictionBoxBubbleChart";
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
       <FrictionBoxBubbleChart tableDto={this.state.tableDto}/>
      </div>
    );
  }
}
