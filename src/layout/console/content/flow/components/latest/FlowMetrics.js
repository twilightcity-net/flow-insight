import React, {Component} from "react";

/**
 * this is the gui component that displays the metrics side panel on the flow dashboard
 */
export default class FlowMetrics extends Component {
  /**
   * builds the IFM chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowMetrics]";
  }


  /**
   * Initially when we get the first set of props, display our metrics
   */
  componentDidMount() {

  }

  /**
   * renders the metrics display
   * @returns {*}
   */
  render() {
    let tip = "Time it takes to get momentum going first thing in the morning";

    return (
      <div className="metricsPanel">
        <div className="summaryMetrics">
          <div className="metricsHeader">Time to Momentum (TTM)</div>
          <div className="metric">24 min</div>
          <div className="metricDescription">Average time it takes to get momentum going first thing in the morning</div>
        </div>
        <div className="space">&nbsp;</div>

        <div className="summaryMetrics">
          <div className="metricsHeader">Longest Flow Streak (LFS)</div>
          <div className="metric">123 min</div>
          <div className="metricDescription">Longest amount of time in flow state where momentum was sustained</div>
        </div>
      </div>
    );
  }
}
