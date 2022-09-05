import React, {Component} from "react";
import {DimensionController} from "../../../../../../controllers/DimensionController";
import LatestWeekChart from "./LatestWeekChart";
import {Icon} from "semantic-ui-react";

/**
 * this component handles the main latest week flow intro dashboard
 */
export default class LatestWeekContent extends Component {
  /**
   * the constructor function which builds the LatestWeekContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + LatestWeekContent.name + "]";
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

    let closeContent = "";

    if (this.props.chartDto) {
      flowContent = (
        <div className="flowContentWrapper">
          <LatestWeekChart
            chartDto={this.props.chartDto}
            onClickDayBox={this.onClickDayBox}
          />
        </div>
      );
      if (this.props.hasCloseOption) {
        closeContent = (
          <div className="closeIcon">
            <Icon
              name="close"
              size="large"
              onClick={this.onClickClose}
            />
          </div>
        );
      }
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
        {closeContent}
        {flowContent}
      </div>
    );
  }
}
