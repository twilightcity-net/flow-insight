import React, { Component } from "react";
import { Button, Segment } from "semantic-ui-react";
import { DataModelFactory } from "../../models/DataModelFactory";
import { ActiveCircleModel } from "../../models/ActiveCircleModel";
import { WTFTimer } from "../../models/WTFTimer";
import { DimensionController } from "../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class TroubleshootOpen extends Component {
  /**
   * the constructor, duh
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TroubleshootOpen]";
    this.myController = props.ctlr;

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
    console.log(this.name + " - componentDidMount");
    this.wtfTimer.registerListener(
      "TroubleshootOpen",
      WTFTimer.CallbackEvent.WTF_TIMER_SECONDS_UPDATE,
      this.onTimerUpdate
    );

    this.activeCircleModel.registerListener(
      "TroubleshootOpen",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onCircleUpdate
    );

    this.onCircleUpdate();
    this.onTimerUpdate();
    this.wtfTimer.startTimer();
  };

  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.wtfTimer.stopTimer();
    this.activeCircleModel.unregisterAllListeners("TroubleshootOpen");
    this.wtfTimer.unregisterAllListeners("TroubleshootOpen");
  };

  /**
   * when the cir4ucle updates
   */
  onCircleUpdate = () => {
    console.log(this.name + " - onCircleUpdate");

    let activeCircle = this.activeCircleModel.getActiveScope().activeCircle;
    let circleName = this.activeCircleModel.getActiveScope().circleName;

    let circleOwner = this.activeCircleModel.getActiveScope().getCircleOwner();

    let formattedTime = this.wtfTimer.wtfTimerInSeconds;
    this.setState({
      formattedWTFTimer: formattedTime,
      activeCircle: activeCircle,
      circleName: circleName,
      circleOwner: circleOwner
    });
  };

  /**
   * used to store the wtf timer counter
   */
  onTimerUpdate = () => {
    this.setState({
      formattedWTFTimer: this.wtfTimer.wtfTimerInSeconds
    });
  };

  /**
   * callled when the solved button is clicked
   */
  onClickStopTroubleshooting = () => {
    console.log(this.name + " - on click stop troubleshooting");

    this.props.onStopTroubleshooting();
  };

  /**
   * gets the realtime content feed of the troubleshooting panel
   * @returns {*}
   */
  getTroubleshootFeed() {
    return (
      <div id="component" className="troubleshootFeed">
        <Segment
          className="troubleshootFeed"
          inverted
          style={{
            height: DimensionController.getHeightFor(this)
          }}
        >
          Troubleshoot Content Troubleshoot Open
        </Segment>
      </div>
    );
  }

  /**
   * gets the sidebar react component for the content panel of troubleshoot
   * @returns {*}
   */
  getTroubleshootSidebar() {
    return (
      <div id="component" className="troubleshootSidebar">
        <Segment className="troubleshootSidebar" inverted>
          <Segment inverted>Troubleshoot Content</Segment>
          <Segment inverted>room: {this.state.circleName}</Segment>
          <Segment inverted>owner: {this.state.circleOwner}</Segment>
          <Segment inverted>time: {this.state.formattedWTFTimer}</Segment>
          <Segment inverted>
            <Button
              onClick={this.onClickStopTroubleshooting}
              size="big"
              color="purple"
              animated="fade"
            >
              <Button.Content visible>YAY!</Button.Content>
              <Button.Content hidden>WTF Resolved!</Button.Content>
            </Button>
          </Segment>
        </Segment>
      </div>
    );
  }

  /**
   * renders the default troubleshoot component in the console view
   */
  render() {
    return (
      <div id="component" className="troubleshootContent">
        <SplitterLayout
          percentage={true}
          primaryIndex={0}
          primaryMinSize={25}
          secondaryMinSize={25}
          secondaryInitialSize={40}
          style={{
            height: DimensionController.getHeightFor(this)
          }}
        >
          <div>
            <div id="wrapper" className="troubleshootFeed">
              {this.getTroubleshootFeed()}
            </div>
          </div>
          <div>
            <div id="wrapper" className="troubleshootSidebar">
              {this.getTroubleshootSidebar()}
            </div>
          </div>
        </SplitterLayout>
      </div>
    );
  }
}
