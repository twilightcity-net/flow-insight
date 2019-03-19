import React, { Component } from "react";
import { Button, Divider, Grid, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../models/DataModelFactory";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { WTFTimer } from "../models/WTFTimer";

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

    this.wtfTimer = DataModelFactory.createModel(
      DataModelFactory.Models.WTF_TIMER,
      this
    );
  }

  componentDidMount = () => {
    console.log("TroubleshootSessionOpen : componentDidMount");
    this.wtfTimer.registerListener(
      "TroubleshootSessionOpen",
      WTFTimer.CallbackEvent.WTF_TIMER_SECONDS_UPDATE,
      this.onTimerUpdate
    );

    this.activeCircleModel.registerListener(
      "TroubleshootSessionOpen",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onCircleUpdate
    );

    this.onCircleUpdate();
    this.onTimerUpdate();
    this.wtfTimer.startTimer();
  };

  componentWillUnmount = () => {
    console.log("TroubleshootSessionOpen : componentWillUnmount");

    this.wtfTimer.stopTimer();
    this.activeCircleModel.unregisterAllListeners("TroubleshootSessionOpen");
    this.wtfTimer.unregisterAllListeners("TroubleshootSessionOpen");
  };

  onCircleUpdate = () => {
    console.log("TroubleshootSessionOpen : onCircleUpdate");

    let activeCircle = this.activeCircleModel.getActiveScope().activeCircle;
    let circleName = this.activeCircleModel.getActiveScope().circleName;

    let circleOwner = this.activeCircleModel.getActiveScope().getCircleOwner();

    console.log("CIRCLE OWNER ME2 : " + circleOwner);

    let formattedTime = this.wtfTimer.wtfTimerInSeconds;
    this.setState({
      formattedWTFTimer: formattedTime,
      activeCircle: activeCircle,
      circleName: circleName,
      circleOwner: circleOwner
    });
  };

  onTimerUpdate = () => {
    this.setState({
      formattedWTFTimer: this.wtfTimer.wtfTimerInSeconds
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
              <div>Circle: {this.state.circleName}</div>
              <div>Owner: {this.state.circleOwner}</div>
              <div>{this.state.formattedWTFTimer}</div>
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
