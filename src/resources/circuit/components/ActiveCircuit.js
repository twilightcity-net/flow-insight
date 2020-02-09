import React, { Component } from "react";
import { Button, Divider, Grid, Icon, Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import { ActiveViewControllerFactory } from "../../../controllers/ActiveViewControllerFactory";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";

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
  getCircuitFeed() {
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
          Active Circuit Feed
        </Segment>
      </div>
    );
  }

  getCircuitContentPanel() {
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
          Active Circuit Content
        </Segment>
      </div>
    );
  }

  getCircuitContentSidebar() {
    return (
      <div id="component" className="circuitContentSidebar">
        <Segment
          inverted
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          <Segment inverted className="member">
            Joined Members List
          </Segment>
          <Divider />
          <Segment inverted className="title">
            <Grid columns="equal" inverted>
              <Grid.Row stretched>
                <Grid.Column
                  className="time"
                  textAlign="center"
                  verticalAlign="middle"
                >
                  <Label color="red">
                    <span>
                      <div className="hours">34m</div>
                      <div className="secs">56s</div>
                    </span>
                  </Label>
                </Grid.Column>
                <Grid.Column
                  className="name"
                  textAlign="left"
                  verticalAlign="middle"
                >
                  Angry Teachers Heaven And Some More Text For REALLY long
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
          <Divider />
          <Segment inverted className="member">
            <Label color="grey" size="tiny">
              JavaScript
            </Label>
          </Segment>
          <Divider />
          <Segment inverted className="desc">
            The property was originally a nonstandard and unprefixed Microsoft
            extension called word-wrap, and was implemented by most browsers
            with the same name. It has since been renamed to overflow-wrap, with
            word-wrap being an alias.
          </Segment>
          <Divider />
          <Segment inverted className="actions">
            <Grid columns="equal" inverted>
              <Grid.Row stretched verticalAlign="middle">
                <Grid.Column>
                  <Button
                    onClick={this.onClickRetroActiveCircuit}
                    size="medium"
                    color="purple"
                    animated="fade"
                  >
                    <Button.Content visible>
                      <icon name="user" />
                      solved
                    </Button.Content>
                    <Button.Content hidden>retro...</Button.Content>
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button
                    onClick={this.onClickHoldActiveCircuit}
                    size="medium"
                    color="grey"
                    animated="fade"
                  >
                    <Button.Content visible>later</Button.Content>
                    <Button.Content hidden>hold...</Button.Content>
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button
                    onClick={this.onClickCancelActiveCircuit}
                    size="medium"
                    color="grey"
                    animated="fade"
                  >
                    <Button.Content visible>cancel</Button.Content>
                    <Button.Content hidden>close...</Button.Content>
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
        className="circuitContent"
        style={{ height: DimensionController.getActiveCircuitContentHeight() }}
      >
        <div id="wrapper" className="circuitContentPanel">
          <div id="component" className="circuitContentPanel">
            <Segment inverted>Content</Segment>
          </div>
          {/*<SplitterLayout*/}
          {/*  id="component"*/}
          {/*  customClassName="circuitContentPanel"*/}
          {/*  percentage={true}*/}
          {/*  primaryIndex={0}*/}
          {/*  primaryMinSize={25}*/}
          {/*  secondaryMinSize={25}*/}
          {/*  secondaryInitialSize={25}*/}
          {/*>*/}
          {/*  <div>*/}
          {/*    <div id="wrapper" className="circuitFeed">*/}
          {/*      {this.getCircuitFeed()}*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <div>*/}
          {/*    <div id="wrapper" className="circuitContentPanel">*/}
          {/*      {this.getCircuitContentPanel()}*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</SplitterLayout>*/}
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          <div id="component" className="circuitContentSidebar">
            {this.getCircuitContentSidebar()}
          </div>
        </div>
      </div>
    );
  }
}
