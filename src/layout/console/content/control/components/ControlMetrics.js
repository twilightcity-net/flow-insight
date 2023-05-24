import React, {Component} from "react";

/**
 * this is the gui component that displays the metrics side panel on the wtfs control page
 */
export default class ControlMetrics extends Component {
  /**
   * builds the metrics
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ControlMetrics]";
    this.state = {
    };
  }

  /**
   * Initially when we get the first set of props, display our metrics
   */
  componentDidMount() {
    this.recalculateMetricsModel(this.props.chartDto);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.chartDto && this.props.chartDto && prevProps.chartDto !== this.props.chartDto) {
      this.recalculateMetricsModel(this.props.chartDto);
    }
  }

  recalculateMetricsModel(chartDto) {
    if (chartDto) {
      // let ttmModel = this.calculateTtmModel(chartDto);
      //
      // if (ttmModel) {
      //   let today = this.findTodayCoords(chartDto);
      //   this.setState({
      //     activeTtms: ttmModel.weeklyTtms,
      //     ttmModel: ttmModel,
      //     todayCoords: today
      //   });
      }
  }

  /**
   * renders the metrics display
   * @returns {*}
   */
  render() {

    // let ttmMins = "--";
    // let lfsMins = "--";

    console.log("Rendering our control metrics");
    return (
      <div className="metricsPanel">
        <div className="summaryMetrics">
          <div className="metricsHeader">WTFs Per Day (WPD)</div>
          <div className="metric">23.7</div>
          <div className="metricDescription">Average number of WTFs per work day totaled across the team</div>
        </div>
        <div className="space">&nbsp;</div>

        <div className="summaryMetrics">
          <div className="metricsHeader">Time to Resolve (MTTR)</div>
          <div className="metric">15 min</div>
          <div className="metricDescription">Average time to resolve a troubleshooting session across all members of the team</div>
        </div>
      </div>
    );
    }
}
