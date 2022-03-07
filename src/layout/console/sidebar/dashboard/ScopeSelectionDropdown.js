import React, {Component} from "react";
import {Dropdown, Grid, Image} from "semantic-ui-react";

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
    this.state = {
      selectedTarget: "me",
      selectedTimeScope: "all-time"
    };

    this.targetOptions = [
      {key: 1, value: "me", text: "For: Me"},
      {key: 2, value: "team", text: "For: Team"},
    ]

    this.timeScopeOptions = [
      {key: 1, value: "all-time", text: "All Time"},
      {key: 2, value: "latest-two", text: "Two Weeks"},
      {key: 3, value: "latest-four", text: "Four Weeks"},
      {key: 4, value: "latest-six", text: "Six Weeks"},
    ]
  }

  handleChangeForTarget = (e, { value }) => {
    console.log()
    this.setState({
      selectedTarget: value
    });
  }

  handleChangeForTimeScope = (e, { value }) => {
    this.setState({
      selectedTimeScope: value
    });
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
