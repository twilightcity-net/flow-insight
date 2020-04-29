import React, { Component } from "react";
import {
  Button,
  Grid,
  Icon,
  Label,
  List,
  Menu,
  Popup,
  Segment
} from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import PartyPanelListItem from "./PartyPanelListItem";
import { TeamClient } from "../../../../../clients/TeamClient";
import moment from "moment";
import UtilRenderer from "../../../../../UtilRenderer";

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
  onClickPauseActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.myController.pauseCircuit(circuitName);
  };

  /**
   * click handler for when we want to cancel a circuit with out hold or lettuce
   */
  onClickCancelActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.myController.cancelCircuit(circuitName);
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
    return me && me.id === id;
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
          height: DimensionController.getCircuitSidebarHeight()
        }}
      >
        <Menu size="mini" inverted pointing secondary>
          <Menu.Item
            name={CircuitSidebar.Views.OVERVIEW}
            active={
              this.state.activeMenuView ===
              CircuitSidebar.Views.OVERVIEW
            }
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            name={CircuitSidebar.Views.PARTY}
            active={
              this.state.activeMenuView ===
              CircuitSidebar.Views.PARTY
            }
            onClick={this.handleMenuClick}
          >
            {this.getMenuItemPartyContent()}
          </Menu.Item>
          <Menu.Item
            name={CircuitSidebar.Views.SCRAPBOOK}
            active={
              this.state.activeMenuView ===
              CircuitSidebar.Views.SCRAPBOOK
            }
            onClick={this.handleMenuScrapbookClick}
          />
          <Menu.Item
            name={CircuitSidebar.Views.CHEST}
            active={
              this.state.activeMenuView ===
              CircuitSidebar.Views.CHEST
            }
            onClick={this.handleMenuClick}
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
      case CircuitSidebar.Views.SCRAPBOOK:
        return this.getCircuitSidebarScrapbookContent();
      case CircuitSidebar.Views.CHEST:
        return this.getCircuitSidebarChestContent();
      default:
        throw new Error(
          "Unknown circuit sidebar menu type '" +
            this.state.activeMenuView +
            "'"
        );
    }
  }

  /**
   * manages our gui update for our wtf timer
   * @returns {string}
   */
  getWtfTimerCount() {
    let circuit = this.props.model;

    if (circuit) {
      this.openTime = moment.utc([
        circuit.openTime[0],
        circuit.openTime[1] - 1,
        circuit.openTime[2],
        circuit.openTime[3],
        circuit.openTime[4],
        circuit.openTime[5]
      ]);
      this.timerEl = document.getElementById(
        "active-circuit-wtf-timer"
      );
      this.openTimeTimer = UtilRenderer.clearIntervalTimer(
        this.openTimeTimer
      );
      this.openTimeTimer = setInterval(() => {
        this.timerEl.innerHTML = UtilRenderer.getWtfTimerStringFromOpenTime(
          this.openTime
        );
      }, 1000);
    }

    return UtilRenderer.getWtfTimerStringFromOpenTime(
      this.openTime
    );
  }

  /**
   * make sure we remove any static timers which are used to update the wtf
   * time on the gui
   */
  componentWillUnmount() {
    UtilRenderer.clearIntervalTimer(this.openTimeTimer);
  }

  /**
   * renders the circuit sidebar menu content for the overview section.
   * This section contains a timer that counts up from start time, a title
   * for the room, as well a a description along with an array of hashtag
   * labels
   * @returns {*}
   */
  getCircuitSidebarOverviewContent() {
    let circuitName = "WTF...",
      description = "Can has some descriptions?",
      tags = ["..."];

    if (this.props.model) {
      circuitName = this.props.model.circuitName;
      description = this.props.model.description;
      tags = this.props.model.tags
        ? this.props.model.tags
        : tags;
      if (!description || description === "") {
        description = "Can has some descriptions?";
      }
    }

    return (
      <div className="overview">
        <Segment inverted className="title">
          {UtilRenderer.getFormattedCircuitName(
            circuitName
          )}
        </Segment>
        {this.getDescriptionContent(description)}

        {this.getTagsMapContent(tags)}
      </div>
    );
  }

  /**
   * gets our circuit's description content body
   * @param description
   * @returns {*}
   */
  getDescriptionContent(description) {
    return (
      <Popup
        content="Click here to add a description."
        mouseEnterDelay={420}
        mouseLeaveDelay={210}
        on="hover"
        inverted
        position={"top center"}
        trigger={
          <Segment inverted className="desc">
            {description}
          </Segment>
        }
      />
    );
  }

  /**
   * gets our tags content body from our array of tags
   * @param tags
   * @returns {*}
   */
  getTagsMapContent(tags) {
    let tagsContent = (
      <Popup
        content="Click here to add a tag"
        mouseEnterDelay={420}
        mouseLeaveDelay={210}
        on="hover"
        position={"top center"}
        inverted
        trigger={
          <Label color="red" size="tiny">
            <i>Add Some Tags!</i>
          </Label>
        }
      />
    );

    if (tags.length > 1 && tags[1] !== "...") {
      tagsContent = tags.map((s, i) => (
        <Label color="grey" size="tiny" key={i}>
          {s}
        </Label>
      ));
    }

    return (
      <Segment inverted className="tags">
        {tagsContent}
      </Segment>
    );
  }

  /**
   * decorates our timer counter for wtf sessions based on the circuits
   * open time that is passed in the props.model
   * @returns {*}
   */
  getWtfTimerContent() {
    return (
      <Label color="red" basic className="time">
        <Icon name="lightning" />{" "}
        <span
          className="time"
          id="active-circuit-wtf-timer"
        >
          {this.getWtfTimerCount()}
        </span>
      </Label>
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
        <Segment className="scrapbook" inverted>
          <i>No Items</i>
        </Segment>
      </div>
    );
  }

  /**
   * gets our circuit sidebar wtf timer counter from our circuit's open time
   * @returns {*}
   */
  getCircuitSidebarTimerContent() {
    return (
      <Segment
        className="timer"
        inverted
        style={{
          height: DimensionController.getCircuitSidebarTimerHeight()
        }}
      >
        {this.getWtfTimerContent()}
      </Segment>
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
                onClick={this.onClickPauseActiveCircuit}
                size="medium"
                color="grey"
              >
                <Button.Content>pause</Button.Content>
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
        {this.getCircuitSidebarTimerContent()}
        {this.getCircuitSidebarActions()}
      </div>
    );
  }
}
