import React, {Component} from "react";
import {DimensionController} from "../../../../controllers/DimensionController";
import ControlContent from "./components/ControlContent";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../UtilRenderer";
import {ChartClient} from "../../../../clients/ChartClient";
import {MemberClient} from "../../../../clients/MemberClient";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";

/**
 * this component is the tab panel for the control chart screen
 */
export default class ControlResource extends Component {
  /**
   * builds the control layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ControlResource]";

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

    this.hoverControlPointNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_CONTROL_POINT_HOVER,
        this
      );

    this.reloadChartData();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log("uri = "+this.props.resource.uri);

    if (prevProps.resource.uri !== this.props.resource.uri) {
      this.reloadChartData();
    }
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
   * Unregister events when the page is unloaded
   */
  componentWillUnmount() {
    this.hoverControlPointNotifier.clear();
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

    ChartClient.chartLatestWtfs(timezoneOffset, newWeekOffset,
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

  onClickNavWeek = (navDirection) => {
    console.log("On click nav week direction = "+navDirection);

     let newWeekOffset = this.state.weekOffset + navDirection;

    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.CONTROL,
      newWeekOffset
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  onClickGraphPoint = (point) => {
    console.log("On click circuit point = " + point.circuitName);

    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.RETRO_CIRCUIT,
      UtilRenderer.getCircuitName(point.circuitName)
    );

    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * Called when hovering over a point
   * @param point
   */
  onHoverGraphPoint = (point) => {
    this.hoverControlPointNotifier.dispatch({circuitName: UtilRenderer.getCircuitName(point.circuitName)});
  }

  /**
   * Called when hover point is left
   */
  onHoverOffGraphPoint = () => {
    this.hoverControlPointNotifier.dispatch({circuitName: null});
  }

  /**
   * renders the layout of the control chart
   * @returns {*} - the JSX to render
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.CONTROL_PANEL
    );

    return (
      <div
        id="component"
        className="flowDashboardLayout"
        style={{ height: height }}
      >
        <div id="wrapper" className="flowDashboardContent">
          <ControlContent chartDto={this.state.chartDto}
                                visible={this.state.visible}
                                weekOffset={this.state.weekOffset}
                                me={this.state.me}
                                onClickNavWeek={this.onClickNavWeek}
                                onClickGraphPoint={this.onClickGraphPoint}
                                onHoverGraphPoint={this.onHoverGraphPoint}
                                onHoverOffGraphPoint={this.onHoverOffGraphPoint}/>
        </div>
      </div>
    );
  }
}
