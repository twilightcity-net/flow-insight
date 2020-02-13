import React, { Component } from "react";
import { Button, Divider, Grid, Icon, Menu, Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";
import { SidePanelViewController } from "../../../controllers/SidePanelViewController";

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
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item name={"Overview"} active={true} />
            <Menu.Item name={"Party"} active={false} />
            <Menu.Item name={"Chest"} active={false} />
          </Menu>
          <Label color="red" basic className="time">
            <Icon name="lightning" /> <span className="time"> 00:00:00:00</span>
          </Label>
          <Segment inverted className="title">
            Angry Teachers Heaven And Some More Text For REALLY long
          </Segment>
          <Segment inverted className="desc">
            The property was originally a nonstandard and unprefixed Microsoft
            extension called word-wrap, and was implemented by most browsers
            with the same name. It has since been renamed to overflow-wrap, with
            word-wrap being an alias.
          </Segment>
          <Segment inverted className="tags">
            <Label color="grey" size="tiny">
              JavaScript
            </Label>
            <Label color="grey" size="tiny">
              Java
            </Label>
            <Label color="grey" size="tiny">
              SaSS
            </Label>
            <Label color="grey" size="tiny">
              Gradle
            </Label>
            <Label color="grey" size="tiny">
              GUI
            </Label>
            <Label color="grey" size="tiny">
              DB
            </Label>
            <Label color="grey" size="tiny">
              Technical
            </Label>
            <Label color="grey" size="tiny">
              Game
            </Label>
            <Label color="grey" size="tiny">
              Development
            </Label>
            <Label color="grey" size="tiny">
              SomeRandom Tag
            </Label>
            <Label color="grey" size="tiny">
              Tester
            </Label>
            <Label color="grey" size="tiny">
              Important
            </Label>
            <Label color="grey" size="tiny">
              JavaScript
            </Label>
            <Label color="grey" size="tiny">
              Java
            </Label>
            <Label color="grey" size="tiny">
              SaSS
            </Label>
            <Label color="grey" size="tiny">
              Gradle
            </Label>
            <Label color="grey" size="tiny">
              GUI
            </Label>
            <Label color="grey" size="tiny">
              DB
            </Label>
            <Label color="grey" size="tiny">
              Technical
            </Label>
            <Label color="grey" size="tiny">
              Game
            </Label>
            <Label color="grey" size="tiny">
              Development
            </Label>
            <Label color="grey" size="tiny">
              SomeRandom Tag
            </Label>
            <Label color="grey" size="tiny">
              Tester
            </Label>
            <Label color="grey" size="tiny">
              Important
            </Label>
          </Segment>
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
