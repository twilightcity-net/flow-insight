import React, { Component } from "react";
import { Button, Divider, Grid, Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";

export default class CircuitSidebar extends Component {
  constructor(props) {
    super(props);
    this.myController = props.myController;
    this.state = {
      resource: props.resource
    };
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

  render() {
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
                  >
                    <Button.Content>solved</Button.Content>
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button
                    onClick={this.onClickHoldActiveCircuit}
                    size="medium"
                    color="grey"
                  >
                    <Button.Content>later</Button.Content>
                  </Button>
                </Grid.Column>
                <Grid.Column>
                  <Button
                    onClick={this.onClickCancelActiveCircuit}
                    size="medium"
                    color="grey"
                  >
                    <Button.Content>cancel</Button.Content>
                  </Button>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment>
      </div>
    );
  }
}
