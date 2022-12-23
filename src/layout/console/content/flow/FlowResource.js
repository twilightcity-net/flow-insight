import React, {Component} from "react";
import {ChartClient} from "../../../../clients/ChartClient";
import {DimensionController} from "../../../../controllers/DimensionController";
import FlowDashboardContent from "./components/latest/FlowDashboardContent";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {MemberClient} from "../../../../clients/MemberClient";
import UtilRenderer from "../../../../UtilRenderer";

/**
 * this component is the tab panel wrapper for the flow content
 * @copyright Twilight City, Inc. 2022©®™√
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
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES
    );

    let timezoneOffset = UtilRenderer.getTimezoneOffset();
    console.log("Timezone offset = "+timezoneOffset);

    ChartClient.chartLatestWeek(timezoneOffset,
      this,
      (arg) => {
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data,
            visible: true
          });
        }
      }
    );
  }



  onClickDayBox = (weekCoords, dayCoords) => {
    console.log("Closing dashboard and navigating to journal");

    let chartPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CHART_POPOUT,
        this
      );

    chartPopoutController.openChartWindowForDay(
      MemberClient.me.username,
      dayCoords
    );

  }


  /**
   * renders the flow chart layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.FLOW_PANEL
    );

    return (
      <div
        id="component"
        className="flowDashboardLayout"
        style={{ height: height }}
      >
        <div id="wrapper" className="flowDashboardContent">
          <FlowDashboardContent chartDto={this.state.chartDto}
                                visible={this.state.visible}
                                onClickDayBox={this.onClickDayBox}/>
        </div>
      </div>
    );
  }
}
