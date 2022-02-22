import React, { Component } from "react";
import FlowContent from "./components/FlowContent";
import {ChartClient} from "../../../../clients/ChartClient";

/**
 * this component is the tab panel wrapper for the flow content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class FlowResource extends Component {
  /**
   * builds the flow layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowResource]";
    this.state = {
      resource: props.resource,
    };
  }


  /**
   * Load the chart when the component mounts
   */
  componentDidMount() {
    ChartClient.chartFrictionForTask(
      'tc-desktop',
      'tty',
      'TWENTIES',
      this,
      (arg) => {
        console.log("chart data returnedx!");

        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data
          });
        }
      }
    );
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    return (
      <div id="component" className="flowLayout">
        <div id="wrapper" className="flowContent">
          <FlowContent chartDto={this.state.chartDto}/>
        </div>
      </div>
    );
  }
}
