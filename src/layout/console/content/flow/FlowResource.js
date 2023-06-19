import React, {Component} from "react";
import {ChartClient} from "../../../../clients/ChartClient";
import {DimensionController} from "../../../../controllers/DimensionController";
import FlowDashboardContent from "./components/latest/FlowDashboardContent";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {MemberClient} from "../../../../clients/MemberClient";
import UtilRenderer from "../../../../UtilRenderer";
import {FlowClient} from "../../../../clients/FlowClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";

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
      chartDto: null,
      flowState: null,
      visible: false,
      weekOffset: this.extractWeekOffsetFromArgs()
    };

  }

  /**
   * Load the chart when the component mounts
   */
  componentDidMount() {
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES
    );

    this.reloadChartData();
    this.reloadFlowStateData();

    this.flowStateRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.FLOWSTATE_DATA_REFRESH,
        this,
        this.onFlowStateDataRefresh
      );

  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if (prevProps.resource.uri !== this.props.resource.uri) {
      this.reloadChartData();
    }
  }


  componentWillUnmount() {
    this.flowStateRefreshListener.clear();
  }

  /**
   * Extract the week offset parameter from the uri args
   * @returns {number}
   */
  extractWeekOffsetFromArgs() {
    let weekOffset = 0;
    let arr = this.props.resource.uriArr;
    if (arr.length === 3) {
      let parsedWeekOffset = parseInt(arr[2]);
      if (parsedWeekOffset <= 0) {
        weekOffset = parsedWeekOffset;
      }
    }
    return weekOffset;
  }

  /**
   * Reload the chart data from gridtime, and update the state
   * with the response data
   */
  reloadChartData() {
    if (this.loadChartInProgress) {
      console.warn("Load chart already in progress, ignoring request!");
      return;
    }

    this.loadChartInProgress = true;
    let timezoneOffset = UtilRenderer.getTimezoneOffset();
    console.log("Timezone offset = "+timezoneOffset);

    let newWeekOffset = this.extractWeekOffsetFromArgs();
    console.log("Week offset = "+newWeekOffset);

    ChartClient.chartLatestWeek(timezoneOffset, newWeekOffset,
      this,
      (arg) => {
        this.loadChartInProgress = false;
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            chartDto: arg.data,
            visible: true,
            weekOffset: newWeekOffset,
            me: MemberClient.me
          });
        } else {
          console.error(arg.error);
        }
      }
    );
  }

  /**
   * Reload the flow state momentum data that results in the color of the circle to update
   */
  reloadFlowStateData() {
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
  /**
   * When we get a flow state refresh, refresh our current state from the DB
   */
  onFlowStateDataRefresh() {
    console.log("On flow state data refresh");
    this.reloadFlowStateData();
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

  onClickNavWeek = (navDirection) => {
    console.log("On click nav week direction = "+navDirection);

    let newWeekOffset = this.state.weekOffset + navDirection;

    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.FLOW,
      newWeekOffset
    );
    this.myController.makeSidebarBrowserRequest(request);
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
                                weekOffset={this.state.weekOffset}
                                me={this.state.me}
                                onClickDayBox={this.onClickDayBox}
                                onClickNavWeek={this.onClickNavWeek}/>
        </div>
      </div>
    );
  }
}
