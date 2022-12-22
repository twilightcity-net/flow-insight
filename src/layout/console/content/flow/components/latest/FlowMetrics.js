import React, {Component} from "react";
import {MainPanelViewController} from "../../../../../../controllers/MainPanelViewController";

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
    this.state = {
    };
  }


  /**
   * Initially when we get the first set of props, display our metrics
   */
  componentDidMount() {

    if (this.props.chartDto) {
      let weeklyTtmCalcs = this.calculateWeeklyTtms(this.props.chartDto);
      console.log("Weekly Ttm Calcs: ");
      console.log(weeklyTtmCalcs);

      if (weeklyTtmCalcs) {
        this.setState({
          weeklyTtm: weeklyTtmCalcs
        });
      }
    }

  }

  /**
   * Extract the activate and sustain ttm values from the chart data, to calculate the avg activate,
   * and the max sustain across the time period.
   * @param chartData
   * @returns {{ttm: null}}
   */
  calculateWeeklyTtms(chartData) {
    let ttmSeries = chartData.eventSeriesByType["@ttm/event"].rowsOfPaddedCells;

    let sumTtm = 0;
    let avgTtmActivate = null;
    let maxTtmSustain = null;
    if (ttmSeries && ttmSeries.length > 0) {
      for (let ttmRow of ttmSeries) {
        const ttmActivate = parseInt(ttmRow[5].trim());
        const ttmSustain = parseInt(ttmRow[6].trim());
        console.log(ttmActivate);
        sumTtm += ttmActivate;

        if (ttmSustain && (!maxTtmSustain || ttmSustain > maxTtmSustain)) {
          maxTtmSustain = ttmSustain;
        }
      }
      avgTtmActivate = Math.round(sumTtm / ttmSeries.length) + " min";

      if (maxTtmSustain) {
        maxTtmSustain += " min";
      }
    }

    return { ttm: avgTtmActivate, lfs: maxTtmSustain};
  }

  /**
   * renders the metrics display
   * @returns {*}
   */
  render() {
    let tip = "Time it takes to get momentum going first thing in the morning";

    let ttmMins = "--";
    let lfsMins = "--";

   if (this.state.weeklyTtm && this.state.weeklyTtm.ttm) {
     ttmMins = this.state.weeklyTtm.ttm;
     lfsMins = this.state.weeklyTtm.lfs;
   }

    return (
      <div className="metricsPanel">
        <div className="summaryMetrics">
          <div className="metricsHeader">Time to Momentum (TTM)</div>
          <div className="metric">{ttmMins}</div>
          <div className="metricDescription">Average time it takes to get momentum going first thing in the morning</div>
        </div>
        <div className="space">&nbsp;</div>

        <div className="summaryMetrics">
          <div className="metricsHeader">Longest Flow Streak (LFS)</div>
          <div className="metric">{lfsMins}</div>
          <div className="metricDescription">Longest amount of time in flow state where momentum was sustained</div>
        </div>
      </div>
    );
  }
}
