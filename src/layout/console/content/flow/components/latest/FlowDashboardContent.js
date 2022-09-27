import React, {Component} from "react";
import {DimensionController} from "../../../../../../controllers/DimensionController";
import FlowWeekChart from "./FlowWeekChart";
import {Icon} from "semantic-ui-react";
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
    };
  }

  componentDidMount() {
  }

  onClickClose = () => {
    this.props.onClickClose();
  }

  onClickDayBox = (dayCoords) => {
    const weekCoords = this.createWeekCoordsFromDayCoords(dayCoords);

    this.props.onClickDayBox(weekCoords, dayCoords);
  }

  /**
   * Convert the day coords to week coords, that is, if we pass in gt[2022,6,5,1]
   * we ought to return gt[2022,6,5] chopping off the last coordinate
   * @param dayCoords
   */
  createWeekCoordsFromDayCoords(dayCoords) {
    const parts = dayCoords.split(',');
    let weekCoords = parts[0] + ',' + parts[1] + ',' + parts[2] + ']';
    console.log(weekCoords);

    return weekCoords;
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
        <div className="flowContentWrapper">
          <div className="chartWrapper" style={{width: chartWidth + "px"}}>
            <FlowWeekChart
              chartDto={this.props.chartDto}
              onClickDayBox={this.onClickDayBox}
            />
          </div>
          <div className="metricsWrapper" style={{width: remainingWidth + "px"}}>
            <FlowMetrics/>
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
