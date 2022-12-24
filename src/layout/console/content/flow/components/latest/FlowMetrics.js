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

      if (ttmModel) {
        this.setState({
          activeTtms: ttmModel.weeklyTtms,
          ttmModel: ttmModel
        });
      }
    }

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if ((!prevProps.selectedDay && this.props.selectedDay) ||
      (prevProps.selectedDay && this.props.selectedDay
      && prevProps.selectedDay !== this.props.selectedDay)) {
      this.setActiveTtmsToDayCoords(this.props.selectedDay);
    } else if ((!prevProps.dayCoords && this.props.dayCoords)
      || (this.props.dayCoords && prevProps.dayCoords && prevProps.dayCoords !== this.props.dayCoords)) {

      this.setActiveTtmsToDayCoords(this.props.dayCoords)

    } else if ((!this.props.selectedDay && prevProps.dayCoords && !this.props.dayCoords)
      || (prevProps.selectedDay && !this.props.selectedDay)) {
      this.setActiveTtmsWeeklyCoords();
    } else if (this.props.selectedDay && prevProps.dayCoords && !this.props.dayCoords) {
      this.setActiveTtmsToDayCoords(this.props.selectedDay);
    }

  }

  setActiveTtmsToDayCoords(dayCoords) {
    this.setState((prevState) => {
      let dayTtms = prevState.ttmModel.dailyTtms[dayCoords];
      return {
        activeTtms: dayTtms
      }
    });
  }

  setActiveTtmsWeeklyCoords() {
    this.setState((prevState) => {
      return {
        activeTtms: prevState.ttmModel.weeklyTtms
      }
    });
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

    let ttmSum = 0;
    let ttmCount = 0;
    let maxTtmSustain = null;
    let dailyTtmTable = [];

    if (ttmSeries && ttmSeries.length > 0) {
      for (let ttmRow of ttmSeries) {
        const dayCoords = ttmRow[0].trim();
        const ttmActivate = parseInt(ttmRow[5].trim());
        const ttmSustain = parseInt(ttmRow[6].trim());
        const existingDayRow = dailyTtmTable[dayCoords];

        if (!existingDayRow) {
          //this is the first ttm for this day, include these in the calculation
          ttmSum += ttmActivate;
          ttmCount++;
        }
        dailyTtmTable[dayCoords] = this.updateTtmTableEntry(existingDayRow, ttmActivate, ttmSustain);

        if (ttmSustain && (!maxTtmSustain || ttmSustain > maxTtmSustain)) {
          maxTtmSustain = ttmSustain;
        }
      }
    }

    let ttmModel = {};

    ttmModel.weeklyTtms = { ttmSum: ttmSum, ttmCount: ttmCount, lfs: maxTtmSustain};
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
      //for daily ttms use the first in the morning instead of the average
      //for weekly ttms use the average of the dailies
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
