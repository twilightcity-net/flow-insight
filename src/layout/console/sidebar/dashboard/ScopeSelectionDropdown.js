import React, { Component } from "react";
import { Dropdown, Grid } from "semantic-ui-react";
import DashboardPanel from "./DashboardPanel";
import FeatureToggle from "../../../shared/FeatureToggle";

/**
 * this component is the scope selection dropdown for the risk areas panel
 */
export default class ScopeSelectionDropdown extends Component {
  /**
   * builds our dropdowns
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ScopeSelectionDropdown]";
    this.homeTeam = null;


    this.targetOptionsMeOnly = [
      {
        key: 1,
        value: DashboardPanel.Target.ME,
        text: "For: Me",
      }
    ];

    this.targetOptions = [
      {
        key: 1,
        value: DashboardPanel.Target.ME,
        text: "For: Me",
      },
      {
        key: 2,
        value: DashboardPanel.Target.TEAM,
        text: "For: Team",
      },
    ];

    this.timeScopeOptions = [
      {
        key: 1,
        value: DashboardPanel.TimeScope.ALL,
        text: "All Time",
      },
      {
        key: 2,
        value: DashboardPanel.TimeScope.LATEST_TWO,
        text: "Two Weeks",
      },
      {
        key: 3,
        value: DashboardPanel.TimeScope.LATEST_FOUR,
        text: "Four Weeks",
      },
      {
        key: 4,
        value: DashboardPanel.TimeScope.LATEST_SIX,
        text: "Six Weeks",
      },
    ];
  }

  getTargetOptions() {
    if (FeatureToggle.isIndividualModeEnabled) {
      return this.targetOptionsMeOnly;
    } else {
      return this.targetOptions;
    }
  }

  handleChangeForTarget = (e, { value }) => {
    this.props.onChangeTarget(value);
  };

  handleChangeForTimeScope = (e, { value }) => {
    this.props.onChangeTimeScope(value);
  };

  /**
   * renders our select boxes
   * @returns {*}
   */
  render() {
    return (
      <Grid
        className="scopeSelection"
        inverted
        columns={16}
        style={{
          width: this.props.width,
        }}
      >
        <Grid.Row className="metricHeaderRow">
          <Grid.Column width={8}>
            <Dropdown
              id="selectTarget"
              placeholder="Choose Target"
              options={this.getTargetOptions()}
              selection
              fluid
              value={this.props.target}
              onChange={this.handleChangeForTarget}
            />
          </Grid.Column>
          <Grid.Column width={8}>
            <Dropdown
              id="selectTimeScope"
              placeholder="Choose TimeScope"
              options={this.timeScopeOptions}
              selection
              fluid
              value={this.props.timeScope}
              onChange={this.handleChangeForTimeScope}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
