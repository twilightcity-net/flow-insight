import React, {Component} from "react";
import {Dropdown, Grid} from "semantic-ui-react";
import {TeamClient} from "../../../../clients/TeamClient";

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
    this.state = {
      selectedTarget: ScopeSelectionDropdown.Target.ME,
      selectedTimeScope: ScopeSelectionDropdown.TimeScope.ALL
    };

    this.targetOptions = [
      {key: 1, value: ScopeSelectionDropdown.Target.ME, text: "For: Me"},
      {key: 2, value: ScopeSelectionDropdown.Target.TEAM, text: "For: Team"},
    ]

    this.timeScopeOptions = [
      {key: 1, value: ScopeSelectionDropdown.TimeScope.ALL, text: "All Time"},
      {key: 2, value: ScopeSelectionDropdown.TimeScope.LATEST_TWO, text: "Two Weeks"},
      {key: 3, value: ScopeSelectionDropdown.TimeScope.LATEST_FOUR, text: "Four Weeks"},
      {key: 4, value: ScopeSelectionDropdown.TimeScope.LATEST_SIX, text: "Six Weeks"},
    ]
  }


  static get TargetType() {
    return {
      USER: "user",
      TEAM: "team"
    };
  }

  static get Target() {
    return {
      ME: "me",
      TEAM: "team"
    };
  }

  static get TimeScope() {
    return {
      ALL: "all",
      LATEST_TWO: "latest.two",
      LATEST_FOUR: "latest.four",
      LATEST_SIX: "latest.six"
    };
  }

  componentDidMount() {
    TeamClient.getMyHomeTeam(this, (arg) => {
      if (!arg.error) {
        console.log(arg.data);
        this.homeTeam = arg.data;
      } else {
        //TODO raise error page
        console.error(arg.error);
      }
    });
  }

  handleChangeForTarget = (e, { value }) => {
    let targetType = ScopeSelectionDropdown.TargetType.USER;
    let target = value;

    if (value === ScopeSelectionDropdown.Target.TEAM) {
      targetType = ScopeSelectionDropdown.TargetType.TEAM;
      if (this.homeTeam) {
        target = this.homeTeam.name.toLowerCase();
      } else {
        console.warn("home team not found!");
      }
    }

    this.setState({
      selectedTarget: value,
      targetType: targetType
    });
    this.props.onChangeTarget(target, targetType);
  }

  handleChangeForTimeScope = (e, { value }) => {
    this.setState({
      selectedTimeScope: value
    });
    this.props.onChangeTimeScope(value);
  }

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
          width: this.props.width
        }}
      >
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={8}>
          <Dropdown
            id="selectTarget"
            placeholder="Choose Target"
            options={this.targetOptions}
            selection
            fluid
            value={this.state.selectedTarget}
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
            value={this.state.selectedTimeScope}
            onChange={this.handleChangeForTimeScope}
          />
        </Grid.Column>
      </Grid.Row>
      </Grid>
    );
  }
}
