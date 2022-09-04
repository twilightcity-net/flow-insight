import React, { Component } from "react";
import { ChartClient } from "../../../../../clients/ChartClient";
import { DimensionController } from "../../../../../controllers/DimensionController";
import DashboardPanel from "../../../sidebar/dashboard/DashboardPanel";
import TagMetricTable from "./tags/TagMetricTable";
import WtfMetricTable from "./tags/WtfMetricTable";
import TagBubbleChart from "./tags/TagBubbleChart";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this component shows the top tags per user on the team
 */
export default class TopTagsChartContent extends Component {
  /**
   * the constructor function which builds the TopTagsChartContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + TopTagsChartContent.name + "]";
    this.state = {
      drillDownTag: null,
      tagsTableDto: null,
      wtfsTableDto: null,
      selectedRowId: null,
      hoverRowId: null,
    };
  }

  componentDidMount() {
    this.loadTagsData(
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
      this.loadTagsData(
        this.props.targetType,
        this.props.target,
        this.props.timeScope
      );
    }
  }

  drillDownToWtfsView = (tag) => {
    console.log("drillDownToWtfsView");
    this.loadWtfsData(
      this.props.targetType,
      this.props.target,
      this.props.timeScope,
      tag
    );
  };

  zoomOutToTagsView = () => {
    console.log("zoomOutToTagsView");
    this.setState({
      drillDownTag: null,
      wtfsTableDto: null,
      selectedRowId: null,
      hoverRowId: null,
    });
  };

  /**
   * Load tags data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadTagsData(targetType, target, timeScope) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadTagsDataForTeam(target, timeScope);
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadTagsDataForUser(target, timeScope);
    } else {
      this.loadTagsDataForMe(timeScope);
    }
  }

  /**
   * Load tags data for me (no params default)
   * @param timeScope
   */
  loadTagsDataForMe(timeScope) {
    ChartClient.chartTopTags(timeScope, this, (arg) => {
      this.handleTagsDataResponse(arg);
    });
  }

  /**
   * Load tags data for a specific user
   * @param target
   * @param timeScope
   */
  loadTagsDataForUser(target, timeScope) {
    ChartClient.chartTopTagsForUser(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleTagsDataResponse(arg);
      }
    );
  }

  /**
   * Load tags data for a specific team
   * @param target
   * @param timeScope
   */
  loadTagsDataForTeam(target, timeScope) {
    ChartClient.chartTopTagsForTeam(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleTagsDataResponse(arg);
      }
    );
  }

  /**
   * Load wtfs data for a specific tag for the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   * @param tagName
   */
  loadWtfsData(targetType, target, timeScope, tagName) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadWtfsDataForTeam(tagName, target, timeScope);
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadWtfsDataForUser(tagName, target, timeScope);
    } else {
      this.loadWtfsDataForMe(tagName, timeScope);
    }
  }

  /**
   * Load wtfs data for a specific team and a specific tag
   * @param tagName
   * @param teamName
   * @param timeScope
   */
  loadWtfsDataForTeam(tagName, teamName, timeScope) {
    ChartClient.chartTopWtfsWithTagForTeam(
      teamName,
      tagName,
      timeScope,
      this,
      (arg) => {
        this.handleWtfsDataResponse(arg, tagName);
      }
    );
  }

  /**
   * Load wtfs data for a specific user for a specific tag
   * @param tagName
   * @param target
   * @param timeScope
   */
  loadWtfsDataForUser(tagName, target, timeScope) {
    ChartClient.chartTopWtfsWithTagForUser(
      target,
      tagName,
      timeScope,
      this,
      (arg) => {
        this.handleWtfsDataResponse(arg, tagName);
      }
    );
  }

  /**
   * Load wtfs data for me (no params default)
   * @param tagName
   * @param timeScope
   */
  loadWtfsDataForMe(tagName, timeScope) {
    ChartClient.chartTopWtfsWithTag(
      tagName,
      timeScope,
      this,
      (arg) => {
        this.handleWtfsDataResponse(arg, tagName);
      }
    );
  }

  /**
   * Handle the tags data response and set the state
   * @param response
   */
  handleTagsDataResponse(response) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        tagsTableDto: response.data,
        drillDownTag: null,
        wtfsTableDto: null,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "Tags data load failed",
        error: response.error,
      });
    }
  }

  /**
   * Handle the wtfs data response and set the state
   * @param response
   * @param tag
   */
  handleWtfsDataResponse(response, tag) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        wtfsTableDto: response.data,
        drillDownTag: tag,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "Circuit data load failed",
        error: response.error,
      });
    }
  }

  onClickMetricRow = (rowId) => {
    if (this.state.drillDownTag) {
      this.onClickOpenFlowMap(rowId);
    }

    this.setState({
      selectedRowId: rowId,
    });
  };

  onHoverMetricRow = (rowId) => {
    if (this.state.hoverRowId !== rowId) {
      this.setState({
        hoverRowId: rowId,
      });
    }
  };

  onHoverCircle = (rowId) => {
    this.setState({
      hoverRowId: rowId,
    });
  };

  onClickCircle = (rowId, tag, box) => {
    if (this.state.drillDownTag === null) {
      this.drillDownToWtfsView(tag);
    } else {
      this.onClickOpenFlowMap(rowId);
      if (this.state.selectedRowId === rowId) {
        this.setState({
          selectedRowId: null,
        });
      } else {
        this.setState({
          selectedRowId: rowId,
        });
      }
    }
  };

  onClickOpenFlowMap(rowId) {
    if (!rowId) {
      return;
    }

    let chartPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CHART_POPOUT,
        this
      );

    chartPopoutController.openChartWindowForCircuitTask(
      rowId
    );
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

    if (!this.state.tagsTableDto) {
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
      this.state.tagsTableDto &&
      this.state.tagsTableDto.rowsOfPaddedCells.length === 0
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

    if (this.state.drillDownTag === null) {
      tableContent = (
        <TagMetricTable
          tableDto={this.state.tagsTableDto}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          onHoverMetricRow={this.onHoverMetricRow}
          onClickMetricRow={this.onClickMetricRow}
        />
      );
    } else {
      tableContent = (
        <WtfMetricTable
          tableDto={this.state.wtfsTableDto}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          onHoverMetricRow={this.onHoverMetricRow}
          onClickMetricRow={this.onClickMetricRow}
        />
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
        <TagBubbleChart
          tagsTableDto={this.state.tagsTableDto}
          wtfsTableDto={this.state.wtfsTableDto}
          fileTableDto={this.state.fileTableDto}
          drillDownTag={this.state.drillDownTag}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          onHoverCircle={this.onHoverCircle}
          onClickCircle={this.onClickCircle}
          zoomOutToTagsView={this.zoomOutToTagsView}
        />
        {tableContent}
      </div>
    );
  }
}
