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
    this.state = {
    };
  }


  /**
   * Initially when we get the first set of props, display our metrics
   */
  componentDidMount() {

    if (this.props.chartDto) {
      let ttmModel = this.calculateTtmModel(this.props.chartDto);
      console.log("Weekly Ttm Calcs: ");
      console.log(ttmModel);

      if (ttmModel) {
        this.setState({
          activeTtms: ttmModel.weeklyTtms,
          ttmModel: ttmModel
        });
      }
    }

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if ((!prevProps.dayCoords && this.props.dayCoords)
      || (this.props.dayCoords && prevProps.dayCoords && prevProps.dayCoords !== this.props.dayCoords)) {

      this.setState((prevState) => {
        let dayTtms = prevState.ttmModel.dailyTtms[this.props.dayCoords];
        return {
          activeTtms: dayTtms
        }
      });
    } else if (prevProps.dayCoords && !this.props.dayCoords) {
      this.setState((prevState) => {
        return {
          activeTtms: prevState.ttmModel.weeklyTtms
        }
      });
    }

  }


  /**
   * Calculate the ttm values for a specific day
   * @param chartDto
   * @param dayCoords
   * @returns {{lfs: null, ttm: null}}
   */
  calculateDailyTtms(chartDto, dayCoords) {
    let avgTtmActivate = null;
    let maxTtmSustain = null;

    return { ttm: avgTtmActivate, lfs: maxTtmSustain};
  }

  /**
   * Extract the activate and sustain ttm values from the chart data, to calculate the avg activate,
   * and the max sustain across the time period.  Organizes all the day metrics into indexed table entries
   * @param chartData
   */
  calculateTtmModel(chartData) {
    let ttmSeries = chartData.eventSeriesByType["@ttm/event"].rowsOfPaddedCells;

    let sumTtm = 0;
    let maxTtmSustain = null;
    let dailyTtmTable = [];

    if (ttmSeries && ttmSeries.length > 0) {
      for (let ttmRow of ttmSeries) {
        const dayCoords = ttmRow[0].trim();
        const ttmActivate = parseInt(ttmRow[5].trim());
        const ttmSustain = parseInt(ttmRow[6].trim());
        sumTtm += ttmActivate;

        if (ttmSustain && (!maxTtmSustain || ttmSustain > maxTtmSustain)) {
          maxTtmSustain = ttmSustain;
        }

        dailyTtmTable[dayCoords] = this.updateTtmTableEntry(dailyTtmTable[dayCoords], ttmActivate, ttmSustain);
      }
    }

    let ttmModel = {};

    ttmModel.weeklyTtms = { ttmSum: sumTtm, ttmCount: ttmSeries.length, lfs: maxTtmSustain};
    ttmModel.dailyTtms = dailyTtmTable;

    return ttmModel;
  }

  /**
   * Update the existing table entry based on the new max/average values
   * @param oldEntry
   * @param ttmActivate
   * @param ttmSustain
   */
  updateTtmTableEntry(oldEntry, ttmActivate, ttmSustain) {
    if (!oldEntry) {
      return {ttmSum: ttmActivate, ttmCount: 1, lfs: ttmSustain};
    } else {
      oldEntry.ttmSum += ttmActivate;
      oldEntry.ttmCount += 1;

      if (ttmSustain > oldEntry.lfs) {
        oldEntry.lfs = ttmSustain;
      }
      return oldEntry;
    }
  }

  /**
   * renders the metrics display
   * @returns {*}
   */
  render() {

    let ttmMins = "--";
    let lfsMins = "--";

   if (this.state.activeTtms && this.state.activeTtms.ttmSum) {

     const avgTtm = Math.round(this.state.activeTtms.ttmSum / this.state.activeTtms.ttmCount);

     ttmMins = avgTtm + " min";
     lfsMins = this.state.activeTtms.lfs + " min";
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
