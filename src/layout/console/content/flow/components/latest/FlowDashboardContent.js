import React, {Component} from "react";
import {DimensionController} from "../../../../../../controllers/DimensionController";
import FlowWeekChart from "./FlowWeekChart";
import FlowMetrics from "./FlowMetrics";

/**
 * this component handles the main latest week flow intro dashboard
 */
export default class FlowDashboardContent extends Component {
  /**
   * the constructor function which builds the LatestWeekContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FlowDashboardContent.name + "]";
    this.state = {
      dayCoords: null,
      selectedDay: null
    };
  }

  componentDidMount() {
  }

  onClickClose = () => {
    this.props.onClickClose();
  }

  /**
   * Handler method for when clicking on a day of the week
   * @param dayCoords
   */
  onClickDayBox = (dayCoords) => {
    const weekCoords = this.createWeekCoordsFromDayCoords(dayCoords);

    this.lastDayClick = window.performance.now();

    this.setState({
      selectedDay: dayCoords
    });

    this.props.onClickDayBox(weekCoords, dayCoords);
  }

  onClickNavWeek = (navDirection) => {
    this.props.onClickNavWeek(navDirection);
  }

  /**
   * Handler method for when hovering over a day of the week
   * @param dayCoords
   */
  onHoverDayBox = (dayCoords) => {
    this.setState(({
      dayCoords: dayCoords
    }));
  }

  /**
   * Handler method for when moving off hover for a day of the week
   * @param dayCoords
   */
  onHoverOffDayBox = (dayCoords) => {
    this.setState(({
      dayCoords: null
    }));
  }

  /**
   * Convert the day coords to week coords, that is, if we pass in gt[2022,6,5,1]
   * we ought to return gt[2022,6,5] chopping off the last coordinate
   * @param dayCoords
   */
  createWeekCoordsFromDayCoords(dayCoords) {
    const parts = dayCoords.split(',');
    let weekCoords = parts[0] + ',' + parts[1] + ',' + parts[2] + ']';
    return weekCoords;
  }

  onClickPage = () => {
    const now = window.performance.now();
    if (this.lastDayClick != null && Math.abs(this.lastDayClick - now) > 1000) {
      this.lastDayClick = null;
      this.setState({
        selectedDay: null
      });
    }
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let opacity = 0;
    let flowContent = (
      <div id="component" className="loadingChart">
        Loading...
      </div>
    );

    let chartWidth = Math.round(DimensionController.getFlowPanelWidth() * 0.7);
    let remainingWidth = DimensionController.getFlowPanelWidth() - chartWidth;

    if (this.props.chartDto) {
      flowContent = (
        <div className="flowContentWrapper" onClick={this.onClickPage}>
          <div className="chartWrapper" style={{width: chartWidth + "px"}}>
            <FlowWeekChart
              chartDto={this.props.chartDto}
              flowState={this.props.flowState}
              weekOffset={this.props.weekOffset}
              me={this.props.me}
              onHoverDayBox={this.onHoverDayBox}
              onHoverOffDayBox={this.onHoverOffDayBox}
              onClickDayBox={this.onClickDayBox}
              onClickNavWeek={this.onClickNavWeek}
              selectedDay={this.state.selectedDay}
            />
          </div>
          <div className="metricsWrapper" style={{width: remainingWidth + "px"}}>
            <FlowMetrics
              chartDto={this.props.chartDto}
              dayCoords={this.state.dayCoords}
              selectedDay={this.state.selectedDay}
              />
          </div>
        </div>
      );
    }

    if (this.props.visible) {
      opacity = 1;
    }

    let height = DimensionController.getHeightFor(
      DimensionController.Components.FLOW_PANEL
    );

    return (
      <div
        id="component"
        className="flowDashboardContent"
        style={{
          height: height,
          opacity: opacity
        }}
      >
        {flowContent}
      </div>
    );
  }
}
