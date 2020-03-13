import React, { Component } from "react";
import {
  Button,
  Grid,
  Icon,
  Label,
  List,
  Menu,
  Segment
} from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import PartyPanelListItem from "./PartyPanelListItem";
import { TeamClient } from "../../../../../clients/TeamClient";

/**
 * the class which defines the circuit sidebar panel
 */
export default class CircuitSidebar extends Component {
  /**
   * the possible view we can display in the circuit sidebar panel
   * @returns {{PARTY: string, CHEST: string, OVERVIEW: string}}
   * @constructor
   */
  static get Views() {
    return {
      OVERVIEW: "overview",
      PARTY: "party",
      CHEST: "chest",
      SCRAPBOOK: "scrapbook"
    };
  }

  /**
   * builds our circuit sidebar
   * @param props
   */
  constructor(props) {
    super(props);
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
    this.state = {
      resource: props.resource,
      activeMenuView: CircuitSidebar.Views.OVERVIEW
    };
  }

  /**
   * click handler for starting a retro
   */
  onClickRetroActiveCircuit = () => {
    this.myController.retroActiveCircuitResource();
  };

  /**
   * click handler for putting a circuit on hold
   */
  onClickHoldActiveCircuit = () => {
    this.myController.holdActiveCircuitResource();
  };

  /**
   * click handler for when we want to cancel a circuit with out hold or lettuce
   */
  onClickCancelActiveCircuit = () => {
    this.myController.cancelActiveCircuitResource();
  };

  /**
   * the click handler for the menu of the circuit content sidebar panel
   * @param e
   * @param name
   */
  handleMenuClick = (e, { name }) => {
    this.setState({
      activeMenuView: name
    });
  };

  /**
   * custom event handler for when a user clicks on the scrapbook menu item
   * @param e
   * @param arg
   */
  handleMenuScrapbookClick = (e, arg) => {
    this.handleMenuClick(e, arg);
    this.props.showScrapbook();
  };

  /**
   * selects a team member in the list
   * @param model
   */
  handleClickRow = model => {
    // TODO something
  };

  /**
   * checks to see if this is use based on a member id
   * @param id
   * @returns {boolean}
   */
  isMe(id) {
    let me = TeamClient.getMe();
    if (me && me.id === id) {
      return true;
    }
    return false;
  }

  /**
   * gets the menu item for party content string to display total party members
   * @returns {string}
   */
  getMenuItemPartyContent() {
    let circuit = this.props.model;
    if (circuit && circuit.circuitMembers) {
      let length = circuit.circuitMembers.length;
      return "Party [" + length + "]";
    }
    return "Party []";
  }

  /**
   * renders the circuit sidebar content panel
   * @returns {*}
   */
  getCircuitSidebarContent() {
    return (
      <Segment
        className="content"
        inverted
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.CIRCUIT_SIDEBAR
          )
        }}
      >
        <Menu size="mini" inverted pointing secondary>
          <Menu.Item
            name={CircuitSidebar.Views.OVERVIEW}
            active={this.state.activeMenuView === CircuitSidebar.Views.OVERVIEW}
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            name={CircuitSidebar.Views.PARTY}
            active={this.state.activeMenuView === CircuitSidebar.Views.PARTY}
            onClick={this.handleMenuClick}
          >
            {this.getMenuItemPartyContent()}
          </Menu.Item>
          <Menu.Item
            name={CircuitSidebar.Views.CHEST}
            active={this.state.activeMenuView === CircuitSidebar.Views.CHEST}
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            name={CircuitSidebar.Views.SCRAPBOOK}
            active={
              this.state.activeMenuView === CircuitSidebar.Views.SCRAPBOOK
            }
            onClick={this.handleMenuScrapbookClick}
          />
        </Menu>
        {this.getCircuitSidebarMenuContent()}
      </Segment>
    );
  }

  /**
   * renders the circuit sidebar menu content
   * @returns {*}
   */
  getCircuitSidebarMenuContent() {
    switch (this.state.activeMenuView) {
      case CircuitSidebar.Views.OVERVIEW:
        return this.getCircuitSidebarOverviewContent();
      case CircuitSidebar.Views.PARTY:
        return this.getCircuitSidebarPartyContent();
      case CircuitSidebar.Views.CHEST:
        return this.getCircuitSidebarChestContent();
      case CircuitSidebar.Views.SCRAPBOOK:
        return this.getCircuitSidebarScrapbookContent();
      default:
        throw new Error(
          "Unknown circuit sidebar menu type '" +
            this.state.activeMenuView +
            "'"
        );
    }
  }

  /**
   * renders the circuit sidebar menu content for the overview section.
   * This section contains a timer that counts up from start time, a title
   * for the room, as well a a description along with an array of hashtag
   * labels
   * @returns {*}
   */
  getCircuitSidebarOverviewContent() {
    return (
      <div>
        <Label color="red" basic className="time">
          <Icon name="lightning" /> <span className="time"> 00:00:00:00</span>
        </Label>
        <Segment inverted className="title">
          Angry Teachers Heaven And Some More Text For REALLY long
        </Segment>
        <Segment inverted className="desc">
          The property was originally a nonstandard and unprefixed Microsoft
          extension called word-wrap, and was implemented by most browsers with
          the same name. It has since been renamed to overflow-wrap, with
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
        </Segment>
      </div>
    );
  }

  /**
   * renders the circuit sidebar menu content for the party members
   * whom have join this active circuits trouble shooting wtf session.
   * @returns {*}
   */
  getCircuitSidebarPartyContent() {
    return (
      <div>
        <Segment className="party" inverted>
          {this.getPartyCircuitMembersContent()}
        </Segment>
      </div>
    );
  }

  /**
   * renders the circuit sidebar menu content for chest content. The
   * chest content contains an array of linked resources. for example
   * a snippet or screenshot. These items when clicked on will appear
   * to the left of this panel and to the right of the chat panel within
   * a resizable panel
   * @returns {*}
   */
  getCircuitSidebarChestContent() {
    return (
      <div>
        <Segment className="chest" inverted>
          Chest Items
        </Segment>
      </div>
    );
  }

  /**
   * renders our sidebar scrapbook content panel
   * @returns {*}
   */
  getCircuitSidebarScrapbookContent() {
    return (
      <div>
        <Segment className="chest" inverted>
          <i>No Items</i>
        </Segment>
      </div>
    );
  }

  /**
   * renders the circuit sidebar actions segment
   * @returns {*}
   */
  getCircuitSidebarActions() {
    return (
      <Segment
        className="actions"
        inverted
        style={{
          height: DimensionController.getCircuitSidebarActionsHeight()
        }}
      >
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
    );
  }

  /**
   * renders our list panel content to display all of the members in this circuit
   * @returns {*}
   */
  getPartyCircuitMembersContent() {
    let circuit = this.props.model,
      circuitMembers = [];

    if (circuit && circuit.circuitMembers) {
      circuitMembers = circuit.circuitMembers;
    }
    return (
      <List
        inverted
        divided
        celled
        animated
        verticalAlign="middle"
        size="large"
      >
        {circuitMembers.map(model => (
          <PartyPanelListItem
            key={model.memberId}
            model={model}
            isMe={this.isMe(model.memberId)}
            onClickRow={this.handleClickRow}
          />
        ))}
      </List>
    );
  }

  /**
   * renders the circuit sidebar panel
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="circuitContentSidebar">
        {this.getCircuitSidebarContent()}
        {this.getCircuitSidebarActions()}
      </div>
    );
  }
}
