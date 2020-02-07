import React, { Component } from "react";
import { Button, Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import { ActiveViewControllerFactory } from "../../../controllers/ActiveViewControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveCircuit extends Component {
  /**
   * the constructor, duh
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuit]";
    this.state = {
      resource: props.resource
    };
    this.myController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.RESOURCE_PANEL,
      this
    );
  }

  componentDidMount() {
    console.log(this.name + " load active circuit with members");

    // TODO implement circuit client getActiveCircuitWithMembers()
  }

  onClickRetroActiveCircuit = () => {
    console.log(this.name + " - on click retro active circuit");
    this.myController.retroActiveCircuitResource();
  };

  onClickHoldActiveCircuit = () => {
    console.log(this.name + " - on click hold active circuit");
    this.myController.holdActiveCircuitResource();
  };

  onClickCancelActiveCircuit = () => {
    console.log(this.name + " - on click cancel active circuit");
    this.myController.cancelActiveCircuitResource();
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
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
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
          room: angry_teachers
          <br />
          owner: zoe
          <br />
          time: 00:00:00 <br />
          <Button
            onClick={this.onClickRetroActiveCircuit}
            size="medium"
            color="purple"
            animated="fade"
          >
            <Button.Content visible>Solved</Button.Content>
            <Button.Content hidden>Retro ...</Button.Content>
          </Button>
          <Button
            onClick={this.onClickHoldActiveCircuit}
            size="medium"
            color="grey"
            animated="fade"
          >
            <Button.Content visible>Do Later</Button.Content>
            <Button.Content hidden>Hold ...</Button.Content>
          </Button>
          <Button
            onClick={this.onClickCancelActiveCircuit}
            size="medium"
            color="grey"
            animated="fade"
          >
            <Button.Content visible>Cancel</Button.Content>
            <Button.Content hidden>Remove ...</Button.Content>
          </Button>
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
          secondaryInitialSize={25}
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
