import React, { Component } from "react";
import { Button, Divider, Grid, Segment } from "semantic-ui-react";
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
      ActiveViewControllerFactory.Views.RESOURCES_PANEL,
      this
    );
  }

  /**
   * make sure we load the circuit with members when we load this component
   */
  componentDidMount() {
    console.log(this.name + " load active circuit with members");

    // TODO implement circuit client getActiveCircuitWithMembers()
  }

  /**
   * click handler for starting a retro
   */
  onClickRetroActiveCircuit = () => {
    console.log(this.name + " - on click retro active circuit");
    this.myController.retroActiveCircuitResource();
  };

  /**
   * click handler for putting a circuit on hold
   */
  onClickHoldActiveCircuit = () => {
    console.log(this.name + " - on click hold active circuit");
    this.myController.holdActiveCircuitResource();
  };

  /**
   * click handler for when we want to cancel a circuit with out hold or lettuce
   */
  onClickCancelActiveCircuit = () => {
    console.log(this.name + " - on click cancel active circuit");
    this.myController.cancelActiveCircuitResource();
  };

  /**
   * gets the realtime content feed of the troubleshooting panel
   * @returns {*}
   */
  getActiveCircuitFeed() {
    return (
      <div id="component" className="activeCircuitFeed">
        <Segment
          className="feed"
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

  getActiveCircuitContent() {
    return (
      <div id="component" className="activeCircuitContent">
        <Segment
          className="content"
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

  getActiveCircuitSidebar() {
    return (
      <div id="component" className="activeCircuitSidebar">
        <Segment
          className="sidebar"
          inverted
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          <Segment inverted className="title">
            <Grid columns="equal" inverted>
              <Grid.Row stretched>
                <Grid.Column className="name">
                  Angry Teachers Heaven
                </Grid.Column>
                <Grid.Column
                  className="time"
                  textAlign="right"
                  verticalAlign="middle"
                >
                  5m
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
          <Divider horizontal inverted clearing>
            Joined Members
          </Divider>
          <Segment inverted className="member">
            Joined Members List
          </Segment>
          <Divider />
          <Segment inverted className="btns">
            <Grid columns="equal" inverted>
              <Grid.Row stretched>
                <Grid.Column>
                  <Button
                    onClick={this.onClickRetroActiveCircuit}
                    size="medium"
                    color="purple"
                    animated="fade"
                  >
                    <Button.Content visible>Solved</Button.Content>
                    <Button.Content hidden>Retro...</Button.Content>
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button
                    onClick={this.onClickHoldActiveCircuit}
                    size="medium"
                    color="grey"
                    animated="fade"
                  >
                    <Button.Content visible>Later</Button.Content>
                    <Button.Content hidden>Hold...</Button.Content>
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button
                    onClick={this.onClickCancelActiveCircuit}
                    size="medium"
                    color="grey"
                    animated="fade"
                  >
                    <Button.Content visible>Cancel</Button.Content>
                    <Button.Content hidden>Close...</Button.Content>
                  </Button>
                </Grid.Column>
              </Grid.Row>
            </Grid>
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
      <div
        id="component"
        className="activeCircuitContent"
        style={{ height: DimensionController.getActiveCircuitContentHeight() }}
      >
        <div id="wrapper" className="activeCircuitContentPanel">
          <SplitterLayout
            percentage={true}
            primaryIndex={0}
            primaryMinSize={25}
            secondaryMinSize={25}
            secondaryInitialSize={25}
          >
            <div>
              <div id="wrapper" className="activeCircuitFeed">
                {this.getActiveCircuitFeed()}
              </div>
            </div>
            <div>
              <div id="wrapper" className="activeCircuitContent">
                {this.getActiveCircuitContent()}
              </div>
            </div>
          </SplitterLayout>
        </div>
        <div id="wrapper" className="activeCircuitSidebar">
          {this.getActiveCircuitSidebar()}
        </div>
      </div>
    );
  }
}
