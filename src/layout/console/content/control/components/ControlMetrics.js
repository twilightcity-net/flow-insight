import React, {Component} from "react";
import ControlChart from "./ControlChart";
import FeatureToggle from "../../../../shared/FeatureToggle";

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
      wtfCount: 0
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
      let rows = chartDto.chartSeries.rowsOfPaddedCells;
      let wtfCount = rows.length;
      let oocCount = 0;
      let sumTtr = 0;
      let avgTtr = 0;

      rows.forEach((row) => {
        let durationInSeconds = parseInt(row[3].trim(), 10);
        if (durationInSeconds > ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS) {
          oocCount++;
        }
        sumTtr += durationInSeconds;
      });

      if (wtfCount > 0) {
       avgTtr = Math.round((sumTtr / wtfCount / 60) * 10) / 10;
      }

      this.setState({
        oocCount: oocCount,
        wtfCount: wtfCount,
        avgTtr: avgTtr
      });

    }
  }

  /**
   * renders the metrics display
   * @returns {*}
   */
  render() {

     let wtfCount = "--";
     let ttrMin = "--";

     let oocRatio = "--";
     if (this.state.wtfCount > 0) {
       wtfCount = this.state.wtfCount;
       oocRatio = this.state.oocCount + " / " + this.state.wtfCount;
     }

     if (this.state.avgTtr > 0) {
       ttrMin = this.state.avgTtr + " min";
     }

     let oocDescription = "Ratio of out of control troubleshooting sessions across all members of the team";
     let ttrDescription = "Average time to resolve a troubleshooting session across all members of the team";

     if (FeatureToggle.isIndividualModeEnabled()) {
       oocDescription = "Ratio of out of control troubleshooting sessions for the week";
       ttrDescription = "Average time to resolve a troubleshooting session across all sessions in the week";
     }

    return (
      <div className="metricsPanel">
        <div className="summaryMetrics">
          <div className="metricsHeader">Out of Control Ratio (OOCR)</div>
          <div className="metric">{oocRatio}</div>
          <div className="metricDescription">{oocDescription}</div>
        </div>
        <div className="space">&nbsp;</div>

        <div className="summaryMetrics">
          <div className="metricsHeader">Time to Resolve (MTTR)</div>
          <div className="metric">{ttrMin}</div>
          <div className="metricDescription">{ttrDescription}</div>
        </div>
      </div>
    );
    }
}
