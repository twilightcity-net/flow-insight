import React, { Component } from "react";
import { ChartClient } from "../../../../../clients/ChartClient";
import { DimensionController } from "../../../../../controllers/DimensionController";
import DashboardPanel from "../../../sidebar/dashboard/DashboardPanel";
import MomentumFlowChart from "./momentum/MomentumFlowChart";
import TaskMetricTable from "./momentum/TaskMetricTable";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this component shows the momentum trends over time for user or the team
 */
export default class MomentumChartContent extends Component {
  /**
   * the constructor function which builds the MomentumChartContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + MomentumChartContent.name + "]";
    this.state = {
      taskTableDto: null,
      drillDownWeek: null,
      drillDownDay: null,
      hoverRowId: null,
      selectedRowId: null,
    };
  }

  /**
   * Query bucket size options
   * @returns {{WEEKS:string, DAYS: string}}
   * @constructor
   */
  static get BucketSize() {
    return {
      WEEKS: "WEEKS",
      DAYS: "DAYS",
    };
  }

  componentDidMount() {
    this.loadTopLevelMomentumData(
      this.props.targetType,
      this.props.target,
      this.props.timeScope
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.targetType !== this.props.targetType ||
      prevProps.target !== this.props.target ||
      prevProps.timeScope !== this.props.timeScope
    ) {
      this.loadTopLevelMomentumData(
        this.props.targetType,
        this.props.target,
        this.props.timeScope
      );
    }
  }

  /**
   * Load the initial top level momentum data
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadTopLevelMomentumData(targetType, target, timeScope) {
    this.loadMomentumData(
      targetType,
      target,
      timeScope,
      this.handleMomentumDataResponse
    );
  }

  /**
   * When drilling into a summary box, load the drilldown data
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadDrilldownMomentumData(targetType, target, timeScope) {
    this.loadMomentumData(
      targetType,
      target,
      timeScope,
      this.handleDrilldownMomentumDataResponse
    );
  }

  /**
   * Load momentum data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   * @param callback
   */
  loadMomentumData(
    targetType,
    target,
    timeScope,
    callback
  ) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadMomentumDataForTeam(
        target,
        timeScope,
        callback
      );
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadMomentumDataForUser(
        target,
        timeScope,
        callback
      );
    } else {
      this.loadMomentumDataForMe(timeScope, callback);
    }
  }

  /**
   * Load task data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadTaskData(targetType, target, timeScope) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadTaskDataForTeam(target, timeScope);
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadTaskDataForUser(target, timeScope);
    } else {
      this.loadTaskDataForMe(timeScope);
    }
  }

  /**
   * Load task data for me (no params default)
   * @param timeScope
   */
  loadTaskDataForMe(timeScope) {
    ChartClient.chartTopTasks(timeScope, this, (arg) => {
      this.handleTaskDataResponse(timeScope, arg);
    });
  }

  /**
   * Load task data for me (no params default)
   * @param username
   * @param timeScope
   */
  loadTaskDataForUser(username, timeScope) {
    ChartClient.chartTopTasksForUser(
      username,
      timeScope,
      this,
      (arg) => {
        this.handleTaskDataResponse(timeScope, arg);
      }
    );
  }

  /**
   * Load task data for me (no params default)
   * @param teamName
   * @param timeScope
   */
  loadTaskDataForTeam(teamName, timeScope) {
    ChartClient.chartTopTasksForTeam(
      teamName,
      timeScope,
      this,
      (arg) => {
        this.handleTaskDataResponse(timeScope, arg);
      }
    );
  }

  /**
   * Load momentum data for me (no params default)
   * @param timeScope
   * @param callback
   */
  loadMomentumDataForMe(timeScope, callback) {
    if (this.isDailyScope(timeScope)) {
      ChartClient.chartFriction(
        timeScope,
        MomentumChartContent.BucketSize.DAYS,
        this,
        (arg) => {
          callback(this, timeScope, arg);
        }
      );
    } else {
      ChartClient.chartFriction(
        timeScope,
        MomentumChartContent.BucketSize.WEEKS,
        this,
        (arg) => {
          callback(this, timeScope, arg);
        }
      );
    }
  }

  /**
   * Load momentum data for a specific user
   * @param target
   * @param timeScope
   * @param callback
   */
  loadMomentumDataForUser(target, timeScope, callback) {
    if (this.isDailyScope(timeScope)) {
      ChartClient.chartFrictionForUser(
        target,
        timeScope,
        MomentumChartContent.BucketSize.DAYS,
        this,
        (arg) => {
          callback(this, timeScope, arg);
        }
      );
    } else {
      ChartClient.chartFrictionForUser(
        target,
        timeScope,
        MomentumChartContent.BucketSize.WEEKS,
        this,
        (arg) => {
          callback(this, timeScope, arg);
        }
      );
    }
  }

  /**
   * Load familiarity data for a specific team
   * @param target
   * @param timeScope
   * @param callback
   */
  loadMomentumDataForTeam(target, timeScope, callback) {
    if (this.isDailyScope(timeScope)) {
      ChartClient.chartFrictionForTeam(
        target,
        timeScope,
        MomentumChartContent.BucketSize.DAYS,
        this,
        (arg) => {
          callback(this, timeScope, arg);
        }
      );
    } else {
      ChartClient.chartFrictionForTeam(
        target,
        timeScope,
        MomentumChartContent.BucketSize.WEEKS,
        this,
        (arg) => {
          callback(this, timeScope, arg);
        }
      );
    }
  }

  isDailyScope(timeScope) {
    return (
      timeScope === DashboardPanel.TimeScope.LATEST_TWO ||
      timeScope === DashboardPanel.TimeScope.LATEST_FOUR ||
      timeScope === DashboardPanel.TimeScope.LATEST_SIX ||
      this.isSpecificWeekCoords(timeScope)
    );
  }

  isSpecificWeekCoords(timeScope) {
    if (timeScope.includes("gt[")) {
      let parts = timeScope.split(",");
      if (
        parts.length >= 2 &&
        !timeScope.includes("-") &&
        !timeScope.includes("*")
      ) {
        return true;
      }
    }
    return false;
  }

  getTitleFromBucketSize(bucketSize) {
    if (bucketSize === "DAYS") {
      return "Daily Momentum";
    } else if (bucketSize === "WEEKS") {
      return "Weekly Momentum";
    } else if (bucketSize === "BLOCKS") {
      return "Momentum Per Block";
    }
  }

  /**
   * Handle the task data response and set the state
   * @param timeScope
   * @param response
   */
  handleTaskDataResponse(timeScope, response) {
    if (!response.error) {
      console.log(response.data);
      this.setState((prevState) => {
        if (prevState.selectedRowId === timeScope) {
          return {
            taskTableDto: response.data,
            drillDownDay: timeScope,
            error: null,
            errorContext: null,
          };
        }
        return {};
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "Task data load failed",
        error: response.error,
      });
    }
  }

  /**
   * Handle the momentum data response and set the state
   * @param scope
   * @param timeScope
   * @param response
   */
  handleMomentumDataResponse(scope, timeScope, response) {
    if (!response.error) {
      console.log(response.data);
      scope.setState({
        bucketSize: response.data.bucketSize,
        chartTitle: scope.getTitleFromBucketSize(
          response.data.bucketSize
        ),
        chartDto: response.data,
        selectedRowId: null,
        taskTableDto: null,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      scope.setState({
        errorContext: "Momentum data load failed",
        error: response.error,
      });
    }
  }

  /**
   * Handle the momentum data response and set the state
   * @param scope
   * @param timeScope
   * @param response
   */
  handleDrilldownMomentumDataResponse(
    scope,
    timeScope,
    response
  ) {
    if (!response.error) {
      console.log(response.data);
      scope.setState((prevState) => {
        return {
          bucketSize: response.data.bucketSize,
          chartTitle: scope.getTitleFromBucketSize(
            response.data.bucketSize
          ),
          drillDownWeek: timeScope,
          summaryChartDto: prevState.chartDto,
          chartDto: response.data,
          selectedRowId: null,
          taskTableDto: null,
        };
      });
    } else {
      console.error(response.error);
      scope.setState({
        errorContext: "Drilldown Momentum data load failed",
        error: response.error,
      });
    }
  }

  onClickSummaryBox = (weekCoords) => {
    //need to do a daily data query for this specific week
    this.setState({
      selectedRowId: weekCoords,
    });

    this.loadDrilldownMomentumData(
      this.props.targetType,
      this.props.target,
      weekCoords
    );
  };

  onClickBox = (dayCoords) => {
    if (this.state.selectedRowId === dayCoords) {
      this.setState({
        selectedRowId: null,
        taskTableDto: null,
      });
    } else {
      this.loadTaskData(
        this.props.targetType,
        this.props.target,
        dayCoords
      );
      this.setState({
        selectedRowId: dayCoords,
      });
    }
  };

  onClickMetricRow = (rowId) => {
    //the rowId in this case is the index into the task table

    let rows = this.state.taskTableDto.rowsOfPaddedCells;

    let row = rows[parseInt(rowId, 10)];
    let projectName = row[0].trim();
    let taskName = row[1].trim();
    let username = row[2].trim();

    let chartPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CHART_POPOUT,
        this
      );

    chartPopoutController.openChartWindowForTask(
      projectName,
      taskName,
      username
    );
  };

  onHoverMetricRow = (rowId) => {};

  zoomOutToSummaryView = () => {
    console.log("zoooom out!");

    this.setState((prevState) => {
      return {
        chartDto: prevState.summaryChartDto,
        bucketSize: prevState.summaryChartDto.bucketSize,
        chartTitle: this.getTitleFromBucketSize(
          prevState.summaryChartDto.bucketSize
        ),
        drillDownWeek: null,
        drillDownDay: null,
        taskTableDto: null,
      };
    });
  };

  /**
   * renders the main dashboard content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let tableContent = "";

    if (this.state.error) {
      return UtilRenderer.getErrorPage(
        this.state.errorContext,
        this.state.error
      );
    }

    if (!this.state.chartDto) {
      return (
        <div
          id="component"
          className="dashboardContent"
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.FLOW_PANEL
            ),
          }}
        >
          Loading...
        </div>
      );
    }

    if (
      this.state.chartDto &&
      this.state.chartDto.chartSeries.rowsOfPaddedCells
        .length === 0
    ) {
      return (
        <div
          id="component"
          className="dashboardContent"
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.FLOW_PANEL
            ),
          }}
        >
          No Data Available
        </div>
      );
    }

    if (
      this.state.bucketSize ===
      MomentumChartContent.BucketSize.DAYS
    ) {
      tableContent = (
        <TaskMetricTable
          chartDto={this.state.chartDto}
          taskTableDto={this.state.taskTableDto}
          targetType={this.props.targetType}
          bucketSize={this.state.bucketSize}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          onHoverMetricRow={this.onHoverMetricRow}
          onClickMetricRow={this.onClickMetricRow}
        />
      );
    } else if (this.state.chartDto) {
      tableContent = (
        <div style={{ width: "100%" }}>&nbsp;</div>
      );
    }

    return (
      <div
        id="component"
        className="dashboardContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.FLOW_PANEL
          ),
        }}
      >
        <MomentumFlowChart
          bucketSize={this.state.bucketSize}
          chartTitle={this.state.chartTitle}
          chartDto={this.state.chartDto}
          selectedRowId={this.state.selectedRowId}
          drillDownWeek={this.state.drillDownWeek}
          onClickSummaryBox={this.onClickSummaryBox}
          onClickBox={this.onClickBox}
          zoomOutToSummaryView={this.zoomOutToSummaryView}
        />
        {tableContent}
      </div>
    );
  }
}
