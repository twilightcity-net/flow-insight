import React, {Component} from "react";
import {ChartClient} from "../../../../clients/ChartClient";
import {DimensionController} from "../../../../controllers/DimensionController";
import FlowDashboardContent from "./components/latest/FlowDashboardContent";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {MemberClient} from "../../../../clients/MemberClient";
import UtilRenderer from "../../../../UtilRenderer";
import {FlowClient} from "../../../../clients/FlowClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";

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
        } else {
          console.error(arg.error);
        }
      }
    );

    FlowClient.getMyFlowData(this, (arg) => {
      if (!arg.error) {
        this.setState({
          flowState: arg.data
        });
      } else {
        console.error(arg.error);
      }
    });

    this.flowStateRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.FLOWSTATE_DATA_REFRESH,
        this,
        this.onFlowStateDataRefresh
      );
  }


  componentWillUnmount() {
    this.flowStateRefreshListener.clear();
  }

  /**
   * When we get a flow state refresh, refresh our current state from the DB
   */
  onFlowStateDataRefresh() {
    console.log("On flow state data refresh");

    FlowClient.getMyFlowData(this, (arg) => {
      if (!arg.error) {
        console.log(arg.data);
        if (!this.state.flowState || (this.state.flowState && arg.data.momentum !== this.state.flowState.momentum)) {
          console.log("Updating flow state momentum to "+arg.data.momentum);
          this.setState({
            flowState: arg.data
          });
        }
      } else {
        console.error(arg.error);
      }
    });
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
                                flowState={this.state.flowState}
                                visible={this.state.visible}
                                onClickDayBox={this.onClickDayBox}/>
        </div>
      </div>
    );
  }
}
