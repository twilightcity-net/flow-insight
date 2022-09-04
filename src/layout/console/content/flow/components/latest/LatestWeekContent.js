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
