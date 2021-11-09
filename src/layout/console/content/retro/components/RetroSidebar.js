import React, { Component } from "react";
import {
  Button,
  Grid,
  Label,
  List,
  Menu,
  Popup,
  Segment
} from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import RetroPartyListItem from "./RetroPartyListItem";
import { MemberClient } from "../../../../../clients/MemberClient";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * the class which defines the circuit sidebar panel
 */
export default class RetroSidebar extends Component {
  /**
   * the html id for our timer that is dynamically updated.
   * @type {string}
   */
  static wtfTimerId = "active-circuit-wtf-timer";

  /**
   * the interval increment that the wtf timer uses to update the gui with
   * via various UtilRenderer functions which parse nano time into workable
   * seconds, while maintaining nano precision.
   * @type {number}
   */
  static wtfTimerIntervalMs = 1000;

  /**
   * id name string for property for our id field, we use need to use a
   * different primary key for sorting.
   */
  static idFieldStr = "id";

  /**
   * this is the name of the field that we store the circuit members in our
   * dto. it is nice to break these out because this  will allow us to
   * easily change the source data without modifying the logic of the
   * function. this is very useful when needing to test the function.
   * @type {string}
   */
  static circuitMembersFieldStr = "circuitMembers";

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
    this.resourcesController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
    this.state = {
      activeMenuView: RetroSidebar.Views.OVERVIEW
    };
    this.props.set(this);
  }

  /**
   * make sure we remove any static timers which are used to update the wtf
   * time on the gui
   */
  componentWillUnmount() {
    UtilRenderer.clearIntervalTimer(this.wtfTimer);
  }

  /**
   * click handler for starting a retro
   */
  onClickStartRetroCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.startRetro(circuitName);
  };

  /**
   * click handler for when we want to close a circuit when a retro is or isnt started
   */
  onClickCloseActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.closeCircuit(circuitName);
  };

  /**
   * click handler for joining a wtf circuit which makes the member a
   * participant.
   */
  onClickJoinActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.joinCircuit(circuitName);
  };

  /**
   * click handler for leaving a circuit that the member is participating in.
   */
  onClickLeaveActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.leaveCircuit(circuitName);
  };

  /**
   * click handler for putting a circuit on hold
   */
  onClickPauseActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.pauseCircuit(circuitName);
  };

  /**
   * click handler for putting a circuit on hold
   */
  onClickResumeActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.resumeCircuit(circuitName);
  };

  /**
   * click handler for when we want to cancel a circuit with out hold or lettuce
   */
  onClickCancelActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.cancelCircuit(circuitName);
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
    this.props.toggleSidePanel();
  };

  /**
   * selects a team member in the list
   * @param model
   */
  handleClickRow = model => {
    // TODO something
    console.log("XXX", model);
  };

  /**
   * checks to see if this is use based on a member id
   * @param id
   * @returns {boolean}
   */
  isMe(id) {
    let me = MemberClient.me;
    return me && me[RetroSidebar.idFieldStr] === id;
  }

  /**
   * gets the menu item for party content string to display total party members
   * @returns {string}
   */
  getMenuItemPartyContent() {
    let circuitMembers = this.props.circuitMembers;
    if (circuitMembers) {
      return "Party [" + circuitMembers.length + "]";
    }
    return "Party";
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
            name={RetroSidebar.Views.OVERVIEW}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.OVERVIEW
            }
            onClick={this.handleMenuClick}
          />
          <Menu.Item
            name={RetroSidebar.Views.PARTY}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.PARTY
            }
            onClick={this.handleMenuClick}
          >
            {this.getMenuItemPartyContent()}
          </Menu.Item>
          <Menu.Item
            name={RetroSidebar.Views.SCRAPBOOK}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.SCRAPBOOK
            }
            onClick={this.handleMenuScrapbookClick}
          />
          <Menu.Item
            name={RetroSidebar.Views.CHEST}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.CHEST
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
      case RetroSidebar.Views.OVERVIEW:
        return this.getCircuitSidebarOverviewContent();
      case RetroSidebar.Views.PARTY:
        return this.getCircuitSidebarPartyContent();
      case RetroSidebar.Views.SCRAPBOOK:
        return this.getCircuitSidebarScrapbookContent();
      case RetroSidebar.Views.CHEST:
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
   * renders our wtf time from the circuit that is passed into from the
   * renderer.
   * @param circuit
   * @returns {string}
   */
  getWtfTimerCount(circuit) {
    if (!circuit) {
      return "loading...";
    } else {
      this.timerEl = document.getElementById(
        RetroSidebar.wtfTimerId
      );
      this.wtfTimer = UtilRenderer.clearIntervalTimer(
        this.wtfTimer
      );

      if (UtilRenderer.isCircuitTroubleshoot(circuit)) {
        this.wtfTimer = setInterval(() => {
          this.timerEl.innerHTML = UtilRenderer.getWtfTimerFromCircuit(
            circuit
          );
        }, RetroSidebar.wtfTimerIntervalMs);
      }
      return UtilRenderer.getWtfTimerFromCircuit(circuit);
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
    let title = "loading...",
      description = "...",
      tags = ["..."];

    if (this.props.model) {
      title = this.props.model.circuitName;
      description = this.props.model.description;
      tags = this.props.model.tags
        ? this.props.model.tags
        : tags;
      if (!description || description === "") {
        description = "What's the problem?";
      }
    }

    return (
      <div className="overview">
        {this.getTitleContent(title)}
        {this.getDescriptionContent(description)}
        {this.getTagsMapContent(tags)}
      </div>
    );
  }

  /**
   * renders our title content in the gui with the circuit name.
   * @param title
   * @returns {*}
   */
  getTitleContent(title) {
    return (
      <Popup
        content="Click to change the title."
        mouseEnterDelay={420}
        mouseLeaveDelay={210}
        on="hover"
        inverted
        position={"top center"}
        trigger={
          <Segment
            inverted
            className="title"
            onClick={this.onClickTitle}
          >
            {UtilRenderer.getFormattedCircuitName(title)}
          </Segment>
        }
      />
    );
  }

  onClickTitle = () => {
    console.log("clicked on title");
  };

  /**
   * gets our circuit's description content body
   * @param description
   * @returns {*}
   */
  getDescriptionContent(description) {
    return (
      <Popup
        content="Click to change the description."
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
        content="Click to add tags."
        mouseEnterDelay={420}
        mouseLeaveDelay={210}
        on="hover"
        position={"top center"}
        inverted
        trigger={
          <Label color="red" size="tiny">
            <i>Click to Tag!</i>
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

  // setDescription(description) {
  //   this.props.model.description = description;
  //   this.setState({
  //     model: this.state.model
  //   });
  // }

  /**
   * decorates our timer counter for wtf sessions based on the circuits
   * open time that is passed in the state.model
   * @returns {*}
   */
  getWtfTimerContent() {
    let circuit = this.props.model;
    return (
      <Label color="red" basic className="time">
        <span
          className="time"
          id={RetroSidebar.wtfTimerId}
        >
          {this.getWtfTimerCount(circuit)}
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
          <i>No Items</i>
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
   * renders our pause resume button for the gui
   * @returns {*}
   */
  getPauseResumeButtonContent() {
    let circuit = this.props.model;
    if (circuit && UtilRenderer.isCircuitPaused(circuit)) {
      return (
        <Button
          onClick={this.onClickResumeActiveCircuit}
          size="medium"
          color="violet"
        >
          <Button.Content>resume</Button.Content>
        </Button>
      );
    } else if (
      circuit &&
      !UtilRenderer.isCircuitPaused(circuit)
    ) {
      return (
        <Button
          onClick={this.onClickPauseActiveCircuit}
          size="medium"
          color="grey"
        >
          <Button.Content>pause</Button.Content>
        </Button>
      );
    }
    return this.getPausedCircuitButtonContent();
  }

  /**
   * renders our start retro button for the gui
   */
  getStartRetroButtonContent() {
    return (
      <Button
        onClick={this.onClickStartRetroCircuit}
        size="medium"
        color="violet"
      >
        <Button.Content>start retro</Button.Content>
      </Button>
    );
  }

  /**
   * renders our close button for the gui
   */
  getCloseCircuitButtonContent() {
    return (
      <Button
        onClick={this.onClickCloseActiveCircuit}
        size="medium"
        color="grey"
      >
        <Button.Content>close</Button.Content>
      </Button>
    );
  }

  /**
   * renders our close button for the gui
   */
  getRetroFinishedCircuitButtonContent() {
    return (
      <Button
        onClick={this.onClickCloseActiveCircuit}
        size="medium"
        color="violet"
      >
        <Button.Content>finished</Button.Content>
      </Button>
    );
  }

  /**
   * renders our leave button for the gui. anyone whom is joined and is not
   * owner or moderator sees this instead of the admin controls.
   * @returns {*}
   */
  getLeaveActiveCircuitButtonContent() {
    return (
      <Button
        onClick={this.onClickLeaveActiveCircuit}
        size="medium"
        color="grey"
      >
        <Button.Content>leave</Button.Content>
      </Button>
    );
  }

  /**
   * renders our leave button for the gui. anyone whom is joined and is not
   * owner or moderator sees this instead of the admin controls.
   * @returns {*}
   */
  getJoinActiveCircuitButtonContent() {
    return (
      <Button
        onClick={this.onClickJoinActiveCircuit}
        size="medium"
        color="grey">
        <Button.Content>join</Button.Content>
      </Button>
    );
  }

  /**
   * renders our join wtf circuit button. This will join the member as a
   * participate in the active circuit. Doing so will set the members active
   * circuit to this one.
   * @returns {*}
   */
  getInactiveCircuitButtonContent() {
    let circuit = this.props.model;

    if (circuit) {
      if (UtilRenderer.isCircuitPaused(circuit)) {
        return this.getPausedCircuitButtonContent();
      } else if (UtilRenderer.isCircuitTroubleshoot(circuit)) {
        return this.getTroubleshootCircuitButtonContent();
      } else if (UtilRenderer.isCircuitCanceled(circuit)) {
        return this.getCanceledCircuitButtonContent();
      } else if (UtilRenderer.isCircuitClosed(circuit)) {
        return this.getClosedCircuitButtonContent();
      }
    } else {
      return "";
    }
  }

  /**
   * renders our paused button which is generally shown for other
   * participating members. It is disabled and is only shown when the active
   * circuit is actually paused.
   * @returns {*}
   */
  getPausedCircuitButtonContent() {
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>paused</Button.Content>
      </Button>
    );
  }

  /**
   * renders a troubleshooting button if for some reason we end up with a retro
   * rendering for a circuit that is currently active, shouldnt happen unless
   * the resource is directly addressed
   * @returns {*}
   */
  getTroubleshootCircuitButtonContent() {
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>troubleshooting</Button.Content>
      </Button>
    );
  }

  /**
   * renders our canceled button which is shown when viewing a circuit
   * that's already been solved. It is disabled and is only shown when the active
   * circuit is actually canceled.
   * @returns {*}
   */
  getCanceledCircuitButtonContent() {
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>canceled</Button.Content>
      </Button>
    );
  }

  /**
   * renders our closed button which is shown when viewing a circuit
   * that's already been solved and closed. It is disabled and is only shown when the active
   * circuit is actually closed.
   * @returns {*}
   */
  getClosedCircuitButtonContent() {
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>closed</Button.Content>
      </Button>
    );
  }

  /**
   * renders our cancel wtf circuit button in the gui
   * @returns {*}
   */
  getCancelActiveCircuitButtonContent() {
    let circuit = this.props.model;
    if (circuit) {
      return (
        <Button
          onClick={this.onClickCancelActiveCircuit}
          size="medium"
          color="grey"
        >
          <Button.Content>cancel</Button.Content>
        </Button>
      );
    }
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>cancel</Button.Content>
      </Button>
    );
  }

  /**
   * renders the circuit sidebar actions segment
   * @returns {*}
   */
  getCircuitSidebarActions() {

    let circuit = this.props.model;

    let content = "";

    //for a solved circuit, anyone on the team, whether the owner or not, can start a retro
    //if they hit the close button, it should mark for close, and show number of marks.

    //need to know whether the close is marked by them or not already?

    if (circuit && UtilRenderer.isMarkedForCloseByMe(circuit, MemberClient.me) &&
    !UtilRenderer.isCircuitClosed(circuit)) {
      content = (
        <Grid.Row stretched verticalAlign="middle">
          <Grid.Column>
            <Button size="medium" color="grey" disabled>
              <Button.Content>waiting for team ({circuit.memberMarksForClose.length})</Button.Content>
            </Button>
          </Grid.Column>
        </Grid.Row>
      );

    } else {

      if (UtilRenderer.isCircuitSolved(circuit)) {
        content = (
          <Grid.Row stretched verticalAlign="middle">
            <Grid.Column>
              {this.getStartRetroButtonContent()}
            </Grid.Column>
            <Grid.Column>
              {this.getCloseCircuitButtonContent()}
            </Grid.Column>
          </Grid.Row>
        );
      }

      if (UtilRenderer.isCircuitInRetro(circuit)) {

        content = (
          <Grid.Row stretched verticalAlign="middle">
            <Grid.Column>
              {this.getRetroFinishedCircuitButtonContent()}
            </Grid.Column>
          </Grid.Row>
        );

      }

      if (UtilRenderer.isCircuitCanceled(circuit) || UtilRenderer.isCircuitClosed(circuit) ||
        UtilRenderer.isCircuitTroubleshoot(circuit) || UtilRenderer.isCircuitPaused(circuit)) {
        content = (
          <Grid.Row stretched verticalAlign="middle">
            <Grid.Column>
              {this.getInactiveCircuitButtonContent()}
            </Grid.Column>
          </Grid.Row>
        );
      }
    }


    return (
      <Segment
        className="actions"
        inverted
        style={{
          height: DimensionController.getCircuitSidebarActionsHeight()
        }}
      >
        <Grid columns="equal" inverted>
          {content}
        </Grid>
      </Segment>
    );
  }

  /**
   * renders our list panel content to display all of the members in this
   * wtf circuit container
   * @returns {*}
   */
  getPartyCircuitMembersContent() {
    let circuit = this.props.model,
      circuitMembers = this.props.circuitMembers;

    if (circuit && circuitMembers) {
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
            <RetroPartyListItem
              key={model.memberId}
              model={model}
              isMe={this.isMe(model.memberId)}
              onClickRow={this.handleClickRow}
            />
          ))}
        </List>
      );
    } else {
      return <Segment inverted>loading...</Segment>;
    }
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
