import React, {Component} from "react";
import {ChartClient} from "../../../../../clients/ChartClient";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FrictionBoxBubbleChart from "./FrictionBoxBubbleChart";
import FrictionBoxMetricTable from "./FrictionBoxMetricTable";
import FrictionFileMetricTable from "./FrictionFileMetricTable";
import ScopeSelectionDropdown from "../../../sidebar/dashboard/ScopeSelectionDropdown";
import FrictionModuleMetricTable from "./FrictionModuleMetricTable";
import FamiliarityBoxChart from "./FamiliarityBoxChart";

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
      selectedRowId: null,
      hoverRowId: null
    }
  }

  componentDidMount() {
    this.loadFamiliarityData(this.props.targetType, this.props.target, this.props.timeScope);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.targetType !== this.props.targetType || prevProps.target !== this.props.target
    || prevProps.timeScope !== this.props.timeScope) {
      this.loadFamiliarityData(this.props.targetType, this.props.target, this.props.timeScope);
    }
  }

  /**
   * Load familiarity data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadFamiliarityData(targetType, target, timeScope) {
    if (targetType === ScopeSelectionDropdown.TargetType.TEAM) {
      this.loadFamiliarityDataForTeam(target, timeScope);
    } else if (targetType === ScopeSelectionDropdown.TargetType.USER && target !== ScopeSelectionDropdown.Target.ME) {
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
    ChartClient.chartFamiliarity(
      timeScope,
      this,
      (arg) => {
        this.handleFamiliarityDataResponse(arg);
      }
    );
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
        tableDto: response.data
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

  /**
   * renders the main dashboard content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let tableContent = "";

    return (<div
      id="component"
      className="dashboardContent"
      style={{
        height: DimensionController.getHeightFor(
          DimensionController.Components.FLOW_PANEL
        ),
      }}
    >
      <FamiliarityBoxChart tableDto={this.state.tableDto}
                              selectedRowId={this.state.selectedRowId}
                              hoverRowId={this.state.hoverRowId}
                              onHoverCircle={this.onHoverCircle}
                              onClickCircle={this.onClickCircle}
      />
      {tableContent}
    </div>);

  }
}
