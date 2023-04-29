import React, {Component} from "react";
import UtilRenderer from "../../../../../../UtilRenderer";

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
    this.recalculateTtmDataModel(this.props.chartDto);

  }

  findTodayCoords(chartDto) {
    let todayDate = UtilRenderer.getTodayDate();

    if (chartDto) {
      let rows = chartDto.chartSeries.rowsOfPaddedCells;

      for (let row of rows) {
        let columnDateStr = row[1].trim();
        let columnDate = UtilRenderer.getSimpleDateFromLocalTimeStr(columnDateStr);
        if (columnDate === todayDate) {
          return row[0].trim();
        }
      }
    }

    return null;
  }

  recalculateTtmDataModel(chartDto) {
    if (chartDto) {
      let ttmModel = this.calculateTtmModel(chartDto);

      if (ttmModel) {
        let today = this.findTodayCoords(chartDto);
        this.setState({
          activeTtms: ttmModel.weeklyTtms,
          ttmModel: ttmModel,
          todayCoords: today
        });
      }
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.chartDto && this.props.chartDto && prevProps.chartDto !== this.props.chartDto) {
      this.recalculateTtmDataModel(this.props.chartDto);
    }

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
      let dayTtms = prevState.ttmModel.dailyTtms.get(dayCoords);
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
    let dailySeries = chartData.chartSeries.rowsOfPaddedCells;

    let ttmModel = this.createTtmModelFromTtmEvents(ttmSeries, dailySeries);
    ttmModel = this.updateTtmModelFromDailySeries(ttmModel, dailySeries);

    return ttmModel;
  }


  /**
   * Create an initial ttm metrics model from ttm event series
   * @param ttmSeries
   * @param dailySeries
   */
  createTtmModelFromTtmEvents(ttmSeries, dailySeries) {
    let ttmSum = 0;
    let ttmCount = 0;
    let maxTtmSustain = null;
    let dailyTtmTable = new Map();

    if (ttmSeries && ttmSeries.length > 0) {
      for (let ttmRow of ttmSeries) {
        const dayCoords = ttmRow[0].trim();
        const ttmActivate = parseInt(ttmRow[5].trim());
        const ttmSustain = parseInt(ttmRow[6].trim());
        const existingDayRow = dailyTtmTable.get(dayCoords);

        if (!existingDayRow) {
          //this is the first ttm for this day, include these in the calculation
          ttmSum += ttmActivate;
          ttmCount++;
        }
        dailyTtmTable.set(dayCoords, this.updateTtmTableEntry(existingDayRow, ttmActivate, ttmSustain));

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

  updateTtmModelFromDailySeries(ttmModel, dailySeries) {

    let totalDayCount = 0;
    let sumMomentum = 0;

    if (dailySeries && dailySeries.length > 0) {
      for (let dailyRow of dailySeries) {
        const dayCoords = dailyRow[0].trim();
        const totalMomentum = parseInt(dailyRow[9].trim());
        const totalTime = parseInt(dailyRow[2].trim());
        const existingDayRow = ttmModel.dailyTtms.get(dayCoords);

        if (totalTime === 0) {
          continue;
        }

        totalDayCount++;
        sumMomentum += totalMomentum;

        if (existingDayRow) {
          existingDayRow.momentumPerDay = totalMomentum;
        } else {
          ttmModel.dailyTtms.set(dayCoords, {ttmSum: 0, ttmCount: 0, lfs: 0, momentumPerDay: totalMomentum});
        }
      }
      if (totalDayCount > 0) {
        ttmModel.weeklyTtms.momentumPerDay = Math.round((sumMomentum / totalDayCount));
      } else {
        ttmModel.weeklyTtms.momentumPerDay = 0;
      }
    }

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
    let mpd = "--";
    let mpdUnits = "";

   if (this.state.activeTtms && this.state.activeTtms.ttmSum) {

     const avgTtm = Math.round(this.state.activeTtms.ttmSum / this.state.activeTtms.ttmCount);

     ttmMins = avgTtm + " min";

     if (this.state.activeTtms.lfs) {  //lfs can be null if the streak is in progress
       lfsMins = this.state.activeTtms.lfs + " min";
     }
   }

    if (this.state.activeTtms && this.state.activeTtms.momentumPerDay) {  //lfs can be null if the streak is in progress
      mpd = this.state.activeTtms.momentumPerDay;
      mpdUnits = <span className="depthUnit">depth <span className="depthUnitSmall">minutes</span></span>;
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
