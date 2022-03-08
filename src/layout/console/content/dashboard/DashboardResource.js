import React, {Component} from "react";
import DashboardContent from "./components/DashboardContent";
import {DimensionController} from "../../../../controllers/DimensionController";

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
      dashboardType: null,
      target: null,
      timeScope: null
    };
  }

  /**
   * Enumeration of the different available dashboard page items available
   * @returns {{CODEBASE: string}}
   * @constructor
   */
  static get DashboardType() {
    return {
      CODEBASE : "codebase"
    }
  }

  componentDidMount() {
    let arr = this.props.resource.uriArr;
    this.setState({
      dashboardType: arr[1],
      targetType: arr[2],
      target: arr[3],
      timeScope: arr[4]
    })
    console.log(arr);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let arr = this.props.resource.uriArr;

    if (this.props.resource.uri !== prevProps.resource.uri) {
      console.log("update!");
      this.setState({
        dashboardType: arr[1],
        targetType: arr[2],
        target: arr[3],
        timeScope: arr[4]
      });
    }


  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.FLOW_PANEL
    );

    let contentPanel = "";
    if (this.state.dashboardType === DashboardResource.DashboardType.CODEBASE) {
      contentPanel = <DashboardContent targetType={this.state.targetType} target={this.state.target} timeScope={this.state.timeScope}/>;
    }

    return (
      <div
        id="component"
        className="dashboardLayout"
        style={{ height: height }}
      >
        <div id="wrapper" className="dashboardContent">
          {contentPanel}
        </div>
      </div>
    );
  }
}
