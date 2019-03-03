import React, { Component } from "react";
import { Button, Divider, Grid, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../models/DataModelFactory";
import { TeamMembersModel } from "../models/TeamMembersModel";
import { JournalModel } from "../models/JournalModel";
import { ActiveCircleModel } from "../models/ActiveCircleModel";

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootSessionOpen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chatInputValue: "",
      formattedWTFTimer: "00:00"
    };

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
  }

  componentDidMount = () => {
    console.log("TroubleshootSessionOpen : componentDidMount");
    this.activeCircleModel.registerListener(
      "TroubleshootSessionOpen",
      ActiveCircleModel.CallbackEvent.WTF_TIMER_SECONDS_UPDATE,
      this.onTimerUpdate
    );

    this.onTimerUpdate();
  };

  componentWillUnmount = () => {
    console.log("TroubleshootSessionOpen : componentWillUnmount");

    this.activeCircleModel.unregisterAllListeners("TroubleshootSessionOpen");
  };

  onTimerUpdate = () => {
    this.setState({
      formattedWTFTimer: this.activeCircleModel.getWTFTimerInSeconds()
    });
  };

  onClickStopTroubleshooting = () => {
    console.log("on click stop troubleshooting");

    this.props.onStopTroubleshooting();
  };

  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="troubleshootPanelOpenDefault">
        <Divider hidden fitted clearing />
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={6} className="rootLayout">
            <Segment className="wtf" inverted>
              Hey there!
              {this.state.formattedWTFTimer}
              <Button
                onClick={this.onClickStopTroubleshooting}
                size="big"
                color="purple"
                animated="fade"
                attached="bottom"
              >
                <Button.Content visible>Solved!</Button.Content>
                <Button.Content hidden>YAY!</Button.Content>
              </Button>
            </Segment>
          </Grid.Column>
          <Grid.Column width={6} className="rootLayout">
            <Segment inverted />
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
