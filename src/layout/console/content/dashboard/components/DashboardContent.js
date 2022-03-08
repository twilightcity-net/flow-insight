import React, {Component} from "react";
import {ChartClient} from "../../../../../clients/ChartClient";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FrictionBoxBubbleChart from "./FrictionBoxBubbleChart";
import FrictionBoxMetricTable from "./FrictionBoxMetricTable";
import FrictionFileMetricTable from "./FrictionFileMetricTable";
import ScopeSelectionDropdown from "../../../sidebar/dashboard/ScopeSelectionDropdown";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class DashboardContent extends Component {
  /**
   * the constructor function which builds the DashboardContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + DashboardContent.name + "]";
    this.state = {
      drillDownProject: null,
      drillDownBox: null,
      boxTableDto: null,
      fileTableDto: null,
      selectedRowId: null,
      hoverRowId: null
    }
  }

  componentDidMount() {
    this.loadBoxesData(this.props.targetType, this.props.target, this.props.timeScope);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.targetType !== this.props.targetType || prevProps.target !== this.props.target
    || prevProps.timeScope !== this.props.timeScope) {
      this.loadBoxesData(this.props.targetType, this.props.target, this.props.timeScope);
    }
  }

  drillDownToFileView = (project, box) => {
    console.log("drillDownToFileView");

    this.loadBoxDetailData(this.props.targetType, this.props.target, this.props.timeScope, project, box);

  }

  zoomOutToBoxView = () => {
    console.log("zoomOutToBoxView");
    this.setState({
      drillDownProject: null,
      drillDownBox: null,
      fileTableDto: null
    });
  }

  /**
   * Load boxes data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadBoxesData(targetType, target, timeScope) {
    if (targetType === ScopeSelectionDropdown.TargetType.TEAM) {
      this.loadBoxesDataForTeam(target, timeScope);
    } else if (targetType === ScopeSelectionDropdown.TargetType.USER && target !== ScopeSelectionDropdown.Target.ME) {
      this.loadBoxesDataForUser(target, timeScope);
    } else {
      this.loadBoxesDataForMe(timeScope);
    }
  }

  /**
   * Load box data for a specific team
   * @param teamName
   * @param timeScope
   */
  loadBoxesDataForTeam(teamName, timeScope) {
    ChartClient.chartTopBoxesForTeam(
      teamName,
      timeScope,
      this,
      (arg) => {
        this.handleBoxDataResponse(arg);
      }
    );
  }

  /**
   * Load box data for me (no params default)
   * @param timeScope
   */
  loadBoxesDataForMe(timeScope) {
    ChartClient.chartTopBoxes(
      timeScope,
      this,
      (arg) => {
        this.handleBoxDataResponse(arg);
      }
    );
  }

  /**
   * Load box data for a specific user
   * @param target
   * @param timeScope
   */
  loadBoxesDataForUser(target, timeScope) {
    ChartClient.chartTopBoxesForUser(
      target,
      timeScope,
      this,
      (arg) => {
        this.handleBoxDataResponse(arg);
      }
    );
  }


  /**
   * Load file detail data for a specific box, using the target parameters
   * for team or user specified in the resource
   * @param targetType
   * @param target
   * @param timeScope
   * @param project
   * @param box
   */
  loadBoxDetailData(targetType, target, timeScope, project, box) {
    if (targetType === ScopeSelectionDropdown.TargetType.TEAM) {
      this.loadBoxDetailDataForTeam(target, timeScope, project, box);
    } else if (targetType === ScopeSelectionDropdown.TargetType.USER && target !== ScopeSelectionDropdown.Target.ME) {
      this.loadBoxDetailDataForUser(target, timeScope, project, box);
    } else {
      this.loadBoxDetailDataForMe(timeScope, project, box);
    }
  }

  /**
   * Load file detail data for a specific box for a team
   * @param teamName
   * @param timeScope
   * @param project
   * @param box
   */
  loadBoxDetailDataForTeam(teamName, timeScope, project, box) {
    ChartClient.chartTopFilesForBoxForTeam(teamName, timeScope, project, box, this, (arg) => {
      this.handleFileDataResponse(arg, project, box);
    });
  }

  /**
   * Load file detail data for a specific box for a user
   * @param username
   * @param timeScope
   * @param project
   * @param box
   */
  loadBoxDetailDataForUser(username, timeScope, project, box) {
    ChartClient.chartTopFilesForBoxForUser(username, timeScope, project, box, this, (arg) => {
      this.handleFileDataResponse(arg, project, box);
    });
  }

  /**
   * Load file data for a specific box for me (no params default)
   * @param timeScope
   * @param project
   * @param box
   */
  loadBoxDetailDataForMe(timeScope, project, box) {
    ChartClient.chartTopFilesForBox(timeScope, project, box, this, (arg) => {
      this.handleFileDataResponse(arg, project, box);
    });
  }

  /**
   * Handle the box data response and set the state
   * @param response
   */
  handleBoxDataResponse(response) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        boxTableDto: response.data,
        drillDownProject: null,
        drillDownBox: null,
        fileTableDto: null
      });
    } else {
      console.error(response.error);
      //TODO this should load an error page
    }
  }

  /**
   * Handle the file data response and set the state
   * @param response
   * @param project
   * @param box
   */
  handleFileDataResponse(response, project, box) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        fileTableDto: response.data,
        drillDownProject: project,
        drillDownBox: box,
      });
    } else {
      console.error(response.error);
      //TODO this should load an error page
    }
  }


  onClickMetricRow = (rowId) => {
    this.setState({
      selectedRowId : rowId
    });
  }

  onHoverMetricRow = (rowId) => {
    this.setState({
      hoverRowId : rowId
    });
  }

  onHoverCircle = (rowId) => {
    this.setState({
      hoverRowId : rowId
    });
  }

  onClickCircle = (rowId, project, box) => {
    if (this.state.drillDownBox === null) {
      this.drillDownToFileView(project, box);
    } else {
      this.setState({
        selectedRowId : rowId
      });
    }
  }


  /**
   * renders the main dashboard content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let tableContent = "";

    if (this.state.drillDownBox) {
      tableContent =  <FrictionFileMetricTable tableDto={this.state.fileTableDto}
                                               selectedRowId={this.state.selectedRowId}
                                               hoverRowId={this.state.hoverRowId}
                                               onHoverMetricRow={this.onHoverMetricRow}
                                               onClickMetricRow={this.onClickMetricRow}/>

    } else {
      tableContent = <FrictionBoxMetricTable tableDto={this.state.boxTableDto}
                                             selectedRowId={this.state.selectedRowId}
                                             hoverRowId={this.state.hoverRowId}
                                             onHoverMetricRow={this.onHoverMetricRow}
                                             onClickMetricRow={this.onClickMetricRow}/>
    }

    return (<div
      id="component"
      className="dashboardContent"
      style={{
        height: DimensionController.getHeightFor(
          DimensionController.Components.FLOW_PANEL
        ),
      }}
    >
      <FrictionBoxBubbleChart tableDto={this.state.boxTableDto}
                              fileTableDto={this.state.fileTableDto}
                              drilldownBox={this.state.drillDownBox}
                              selectedRowId={this.state.selectedRowId}
                              hoverRowId={this.state.hoverRowId}
                              onHoverCircle={this.onHoverCircle}
                              onClickCircle={this.onClickCircle}
                              zoomOutToBoxView={this.zoomOutToBoxView}
      />
      {tableContent}
    </div>);

  }
}
