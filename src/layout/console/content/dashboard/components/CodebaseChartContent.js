import React, { Component } from "react";
import { ChartClient } from "../../../../../clients/ChartClient";
import { DimensionController } from "../../../../../controllers/DimensionController";
import FrictionBoxBubbleChart from "./codebase/FrictionBoxBubbleChart";
import FrictionBoxMetricTable from "./codebase/FrictionBoxMetricTable";
import FrictionFileMetricTable from "./codebase/FrictionFileMetricTable";
import FrictionModuleMetricTable from "./codebase/FrictionModuleMetricTable";
import DashboardPanel from "../../../sidebar/dashboard/DashboardPanel";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this component shows the codebase friction drilldown chart and related table
 */
export default class CodebaseChartContent extends Component {
  /**
   * the constructor function which builds the CodebaseChartContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + CodebaseChartContent.name + "]";
    this.state = {
      drillDownModule: null,
      drillDownBox: null,
      moduleTableDto: null,
      boxTableDto: null,
      fileTableDto: null,
      selectedRowId: null,
      hoverRowId: null,
    };
  }

  componentDidMount() {
    this.loadModulesData(
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
      this.loadModulesData(
        this.props.targetType,
        this.props.target,
        this.props.timeScope
      );
    }
  }

  drillDownToFileView = (module, box) => {
    console.log("drillDownToFileView");
    this.loadFileData(
      this.props.targetType,
      this.props.target,
      this.props.timeScope,
      module,
      box
    );
  };

  drillDownToBoxView = (module) => {
    console.log("drillDownToBoxView");
    this.loadBoxesData(
      this.props.targetType,
      this.props.target,
      this.props.timeScope,
      module
    );
  };

  zoomOutToModuleView = () => {
    console.log("zoomOutToBoxView");
    this.setState({
      drillDownModule: null,
      drillDownBox: null,
      boxTableDto: null,
      fileTableDto: null,
      selectedRowId: null,
      hoverRowId: null,
    });
  };

  zoomOutToBoxView = () => {
    console.log("zoomOutToBoxView");
    this.setState({
      drillDownBox: null,
      fileTableDto: null,
      selectedRowId: null,
      hoverRowId: null,
    });
  };

  /**
   * Load modules data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadModulesData(targetType, target, timeScope) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadModulesDataForTeam(target, timeScope);
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadModulesDataForUser(target, timeScope);
    } else {
      this.loadModulesDataForMe(timeScope);
    }
  }

  /**
   * Load modules data for me (no params default)
   * @param timeScope
   */
  loadModulesDataForMe(timeScope) {
    ChartClient.chartTopModules(timeScope, this, (arg) => {
      this.handleModuleDataResponse(arg);
    });
  }

  /**
   * Load module data for a specific user
   * @param target
   * @param timeScope
   */
  loadModulesDataForUser(target, timeScope) {
    ChartClient.chartTopModulesForUser(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleModuleDataResponse(arg);
      }
    );
  }

  /**
   * Load module data for a specific team
   * @param target
   * @param timeScope
   */
  loadModulesDataForTeam(target, timeScope) {
    ChartClient.chartTopModulesForTeam(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleModuleDataResponse(arg);
      }
    );
  }

  /**
   * Load boxes data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   * @param module
   */
  loadBoxesData(targetType, target, timeScope, module) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadBoxesDataForTeam(module, target, timeScope);
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadBoxesDataForUser(module, target, timeScope);
    } else {
      this.loadBoxesDataForMe(module, timeScope);
    }
  }

  /**
   * Load box data for a specific team
   * @param module
   * @param teamName
   * @param timeScope
   */
  loadBoxesDataForTeam(module, teamName, timeScope) {
    ChartClient.chartTopBoxesForModuleForTeam(
      module,
      teamName,
      timeScope,
      this,
      (arg) => {
        this.handleBoxDataResponse(arg, module);
      }
    );
  }

  /**
   * Load box data for a specific user
   * @param module
   * @param target
   * @param timeScope
   */
  loadBoxesDataForUser(module, target, timeScope) {
    ChartClient.chartTopBoxesForModuleForUser(
      module,
      target,
      timeScope,
      this,
      (arg) => {
        this.handleBoxDataResponse(arg, module);
      }
    );
  }

  /**
   * Load box data for me (no params default)
   * @param module
   * @param timeScope
   */
  loadBoxesDataForMe(module, timeScope) {
    ChartClient.chartTopBoxesForModule(
      module,
      timeScope,
      this,
      (arg) => {
        this.handleBoxDataResponse(arg, module);
      }
    );
  }

  /**
   * Load file detail data for a specific box, using the target parameters
   * for team or user specified in the resource
   * @param targetType
   * @param target
   * @param timeScope
   * @param module
   * @param box
   */
  loadFileData(targetType, target, timeScope, module, box) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadFileDataForTeam(
        target,
        timeScope,
        module,
        box
      );
    } else if (
      targetType === DashboardPanel.TargetType.USER &&
      target !== DashboardPanel.Target.ME
    ) {
      this.loadFileDataForUser(
        target,
        timeScope,
        module,
        box
      );
    } else {
      this.loadFileDataForMe(timeScope, module, box);
    }
  }

  /**
   * Load file detail data for a specific box for a team
   * @param teamName
   * @param timeScope
   * @param module
   * @param box
   */
  loadFileDataForTeam(teamName, timeScope, module, box) {
    ChartClient.chartTopFilesForBoxForTeam(
      teamName,
      timeScope,
      module,
      box,
      this,
      (arg) => {
        this.handleFileDataResponse(arg, module, box);
      }
    );
  }

  /**
   * Load file detail data for a specific box for a user
   * @param username
   * @param timeScope
   * @param module
   * @param box
   */
  loadFileDataForUser(username, timeScope, module, box) {
    ChartClient.chartTopFilesForBoxForUser(
      username,
      timeScope,
      module,
      box,
      this,
      (arg) => {
        this.handleFileDataResponse(arg, module, box);
      }
    );
  }

  /**
   * Load file data for a specific box for me (no params default)
   * @param timeScope
   * @param module
   * @param box
   */
  loadFileDataForMe(timeScope, module, box) {
    ChartClient.chartTopFilesForBox(
      timeScope,
      module,
      box,
      this,
      (arg) => {
        this.handleFileDataResponse(arg, module, box);
      }
    );
  }

  /**
   * Handle the module data response and set the state
   * @param response
   */
  handleModuleDataResponse(response) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        moduleTableDto: response.data,
        boxTableDto: null,
        drillDownModule: null,
        drillDownBox: null,
        fileTableDto: null,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "Module data load failed",
        error: response.error,
      });
    }
  }

  /**
   * Handle the box data response and set the state
   * @param response
   * @param module
   */
  handleBoxDataResponse(response, module) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        boxTableDto: response.data,
        drillDownModule: module,
        drillDownBox: null,
        fileTableDto: null,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "Box data load failed",
        error: response.error,
      });
    }
  }

  /**
   * Handle the file data response and set the state
   * @param response
   * @param module
   * @param box
   */
  handleFileDataResponse(response, module, box) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        fileTableDto: response.data,
        drillDownBox: box,
        error: null,
        errorContext: null,
      });
    } else {
      console.error(response.error);
      this.setState({
        errorContext: "File data load failed",
        error: response.error,
      });
    }
  }

  onClickMetricRow = (rowId) => {
    this.setState({
      selectedRowId: rowId,
    });
  };

  onHoverMetricRow = (rowId) => {
    this.setState({
      hoverRowId: rowId,
    });
  };

  onHoverCircle = (rowId) => {
    this.setState({
      hoverRowId: rowId,
    });
  };

  onClickCircle = (rowId, module, box) => {
    if (this.state.drillDownModule === null) {
      this.drillDownToBoxView(module);
    } else if (this.state.drillDownBox === null) {
      this.drillDownToFileView(module, box);
    } else {
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

    if (!this.state.moduleTableDto) {
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
      this.state.moduleTableDto &&
      this.state.moduleTableDto.rowsOfPaddedCells.length ===
        0
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

    if (this.state.drillDownModule === null) {
      tableContent = (
        <FrictionModuleMetricTable
          tableDto={this.state.moduleTableDto}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          onHoverMetricRow={this.onHoverMetricRow}
          onClickMetricRow={this.onClickMetricRow}
        />
      );
    } else if (this.state.drillDownBox) {
      tableContent = (
        <FrictionFileMetricTable
          tableDto={this.state.fileTableDto}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          module={this.state.drillDownModule}
          onHoverMetricRow={this.onHoverMetricRow}
          onClickMetricRow={this.onClickMetricRow}
        />
      );
    } else {
      tableContent = (
        <FrictionBoxMetricTable
          tableDto={this.state.boxTableDto}
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
        <FrictionBoxBubbleChart
          moduleTableDto={this.state.moduleTableDto}
          boxTableDto={this.state.boxTableDto}
          fileTableDto={this.state.fileTableDto}
          drilldownModule={this.state.drillDownModule}
          drilldownBox={this.state.drillDownBox}
          selectedRowId={this.state.selectedRowId}
          hoverRowId={this.state.hoverRowId}
          onHoverCircle={this.onHoverCircle}
          onClickCircle={this.onClickCircle}
          zoomOutToBoxView={this.zoomOutToBoxView}
          zoomOutToModuleView={this.zoomOutToModuleView}
        />
        {tableContent}
      </div>
    );
  }
}
