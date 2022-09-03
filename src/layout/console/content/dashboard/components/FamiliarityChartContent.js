import React, { Component } from "react";
import { ChartClient } from "../../../../../clients/ChartClient";
import { DimensionController } from "../../../../../controllers/DimensionController";
import FamiliarityBoxChart from "./familiarity/FamiliarityBoxChart";
import DashboardPanel from "../../../sidebar/dashboard/DashboardPanel";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this component shows the familiarity around the codebase per user on the team
 */
export default class FamiliarityChartContent extends Component {
  /**
   * the constructor function which builds the FamiliarityChartContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FamiliarityChartContent.name + "]";
    this.state = {
      tableDto: null,
    };
  }

  componentDidMount() {
    this.loadFamiliarityData(
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
      this.loadFamiliarityData(
        this.props.targetType,
        this.props.target,
        this.props.timeScope
      );
    }
  }

  /**
   * Load familiarity data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadFamiliarityData(targetType, target, timeScope) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadFamiliarityDataForTeam(target, timeScope);
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadFamiliarityDataForUser(target, timeScope);
    } else {
      this.loadFamiliarityDataForMe(timeScope);
    }
  }

  /**
   * Load familiarity data for me (no params default)
   * @param timeScope
   */
  loadFamiliarityDataForMe(timeScope) {
    ChartClient.chartFamiliarity(timeScope, this, (arg) => {
      this.handleFamiliarityDataResponse(arg);
    });
  }

  /**
   * Load familiarity data for a specific user
   * @param target
   * @param timeScope
   */
  loadFamiliarityDataForUser(target, timeScope) {
    ChartClient.chartFamiliarityForUser(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleFamiliarityDataResponse(arg);
      }
    );
  }

  /**
   * Load familiarity data for a specific team
   * @param target
   * @param timeScope
   */
  loadFamiliarityDataForTeam(target, timeScope) {
    ChartClient.chartFamiliarityForTeam(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleFamiliarityDataResponse(arg);
      }
    );
  }

  /**
   * Handle the familiarity data response and set the state
   * @param response
   */
  handleFamiliarityDataResponse(response) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        tableDto: response.data,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "Familiarity data load failed",
        error: response.error,
      });
    }
  }

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

    if (!this.state.tableDto) {
      return (
        <div
          id="component"
          className="dashboardContent"
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.DASHBOARD_PANEL
            ),
          }}
        >
          Loading...
        </div>
      );
    }

    if (
      this.state.tableDto &&
      this.state.tableDto.rowsOfPaddedCells.length === 0
    ) {
      return (
        <div
          id="component"
          className="dashboardContent"
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.DASHBOARD_PANEL
            ),
          }}
        >
          No Data Available
        </div>
      );
    }

    return (
      <div
        id="component"
        className="dashboardContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.DASHBOARD_PANEL
          ),
        }}
      >
        <FamiliarityBoxChart
          tableDto={this.state.tableDto}
        />
        {tableContent}
      </div>
    );
  }
}
