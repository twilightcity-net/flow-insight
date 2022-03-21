import React, {Component} from "react";
import {ChartClient} from "../../../../../clients/ChartClient";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FamiliarityBoxChart from "./familiarity/FamiliarityBoxChart";
import DashboardPanel from "../../../sidebar/dashboard/DashboardPanel";
import MomentumFlowChart from "./momentum/MomentumFlowChart";

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
      tableDto: null
    }
  }

  /**
   * Query bucket size options
   * @returns {{WEEKS:string, DAYS: string}}
   * @constructor
   */
  static get BucketSize() {
    return {
      WEEKS : "WEEKS",
      DAYS: "DAYS",
    }
  }

  componentDidMount() {
    this.loadMomentumData(this.props.targetType, this.props.target, this.props.timeScope);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.targetType !== this.props.targetType || prevProps.target !== this.props.target
    || prevProps.timeScope !== this.props.timeScope) {
      this.loadMomentumData(this.props.targetType, this.props.target, this.props.timeScope);
    }
  }

  /**
   * Load momentum data using the passed in parameters
   * @param targetType
   * @param target
   * @param timeScope
   */
  loadMomentumData(targetType, target, timeScope) {
    if (targetType === DashboardPanel.TargetType.TEAM) {
      this.loadMomentumDataForTeam(target, timeScope);
    } else if (targetType === DashboardPanel.TargetType.USER && target !== DashboardPanel.Target.ME) {
      this.loadMomentumDataForUser(target, timeScope);
    } else {
      this.loadMomentumDataForMe(timeScope);
    }
  }

  /**
   * Load momentum data for me (no params default)
   * @param timeScope
   */
  loadMomentumDataForMe(timeScope) {
    if (this.isWeeksScope(timeScope)) {
      ChartClient.chartFriction(timeScope, MomentumChartContent.BucketSize.DAYS,
        this,
        (arg) => {
          this.handleMomentumDataResponse(arg);
        }
      );
    } else {
      ChartClient.chartFriction(timeScope, MomentumChartContent.BucketSize.WEEKS,
        this,
        (arg) => {
          this.handleMomentumDataResponse(arg);
        }
      );
    }
  }

  /**
   * Load momentum data for a specific user
   * @param target
   * @param timeScope
   */
  loadMomentumDataForUser(target, timeScope) {
    if (this.isWeeksScope(timeScope)) {
      ChartClient.chartFrictionForUser(target, timeScope, MomentumChartContent.BucketSize.DAYS,
        this,
        (arg) => {
          this.handleMomentumDataResponse(arg);
        }
      );
    } else {
      ChartClient.chartFrictionForUser(target, timeScope, MomentumChartContent.BucketSize.WEEKS,
        this,
        (arg) => {
          this.handleMomentumDataResponse(arg);
        }
      );
    }
  }


  /**
   * Load familiarity data for a specific team
   * @param target
   * @param timeScope
   */
  loadMomentumDataForTeam(target, timeScope) {

    if (this.isWeeksScope(timeScope)) {
      ChartClient.chartFrictionForTeam(target, timeScope, MomentumChartContent.BucketSize.DAYS,
        this,
        (arg) => {
          this.handleMomentumDataResponse(arg);
        }
      );
    } else {
      ChartClient.chartFrictionForTeam(target, timeScope, MomentumChartContent.BucketSize.WEEKS,
        this,
        (arg) => {
          this.handleMomentumDataResponse(arg);
        }
      );
    }



  }

  isWeeksScope(timeScope) {
    return (timeScope === DashboardPanel.TimeScope.LATEST_TWO ||
      timeScope === DashboardPanel.TimeScope.LATEST_FOUR ||
      timeScope === DashboardPanel.TimeScope.LATEST_SIX );
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
   * Handle the momentum data response and set the state
   * @param timeScope
   * @param response
   */
  handleMomentumDataResponse(response) {
    if (!response.error) {
      console.log(response.data);
      this.setState({
        bucketSize: response.data.bucketSize,
        chartTitle: this.getTitleFromBucketSize(response.data.bucketSize),
        chartDto: response.data
      });
    } else {
      console.error(response.error);
      //TODO this should load an error page
    }
  }

  /**
   * renders the main dashboard content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (<div
      id="component"
      className="dashboardContent"
      style={{
        height: DimensionController.getHeightFor(
          DimensionController.Components.FLOW_PANEL
        ),
      }}
    >
      <MomentumFlowChart bucketSize={this.state.bucketSize} chartTitle={this.state.chartTitle} chartDto={this.state.chartDto}/>
    </div>);

  }
}
