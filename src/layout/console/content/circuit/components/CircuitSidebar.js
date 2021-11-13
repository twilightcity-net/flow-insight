import React, { Component } from "react";
import {
  Button, Dropdown,
  Grid,
  Label,
  List,
  Menu,
  Popup,
  Segment
} from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import PartyPanelListItem from "./PartyPanelListItem";
import { MemberClient } from "../../../../../clients/MemberClient";
import UtilRenderer from "../../../../../UtilRenderer";
import {CircuitClient} from "../../../../../clients/CircuitClient";

/**
 * the class which defines the circuit sidebar panel
 */
export default class CircuitSidebar extends Component {
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
      activeMenuView: CircuitSidebar.Views.OVERVIEW,
      tagEditEnabled: false,
      currentTags: [],
      tagOptions: []
    };
    this.props.set(this);
  }


  componentDidUpdate(prevProps, prevState, snapshot) {


    if ((!prevProps.model && this.props.model ) ||
      (prevProps.model && this.props.model && prevProps.model.circuitName !== this.props.model.circuitName)) {

      let currentTags = [];

      if (this.props.model.tags) {
        for (let i = 0 ; i < this.props.model.tags.length; i++ ) {
          let tag = this.props.model.tags[i];
          currentTags.push(tag);
        }
      }

      this.setState({
        tagEditEnabled: false,
        currentTags: currentTags
      });
    }

    if (prevProps.dictionaryWords.length !== this.props.dictionaryWords.length) {

      let tagOptions = [];

      for (let i = 0; i < this.props.dictionaryWords.length; i++) {
        let word = this.props.dictionaryWords[i];

        tagOptions.push({
          key: word.wordName,
          value: word.wordName,
          text: word.wordName
        });
      }

      this.setState({
        tagOptions: tagOptions,
      });
    }

  }

  /**
   * make sure we remove any static timers which are used to update the wtf
   * time on the gui
   */
  componentWillUnmount() {
    UtilRenderer.clearIntervalTimer(this.wtfTimer);
  }

  /**
   * click handler for putting a circuit on hold
   */
  onClickSolveActiveCircuit = () => {
    let circuitName = this.props.model.circuitName;
    this.resourcesController.solveCircuit(circuitName);
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
   * click handler for adding tags to a circuit
   */
  onClickAddTags = () => {
    console.log("Add tags clicked!");
    this.setState({
      tagEditEnabled: true
    });
  };


  /**
   * click handler for adding tags to a circuit
   */
  onClickTagsDone = () => {
    console.log("Tags done!");
    this.setState({
      tagEditEnabled: false
    });

    CircuitClient.saveTags(
      this.props.model.circuitName,
      this.state.currentTags,
      this,
      arg => {
        console.log("callback for tags!");
      }
    );
  };


  /**
   * Handler for updating tags
   */
  handleChangeForTags = (e, { value }) => {

    let cleanVals = [];

    var letters = /^[0-9a-zA-Z]+$/;

    for (let i = 0; i < value.length; i++) {
      let item = value[i];

      if (item.match(letters)) {
        cleanVals.push(item);
      }
    }

    this.setState({
      currentTags: cleanVals
    });
  };

  /**
   * Handler for adding a new tag
   * @param e
   * @param name
   */
  handleAddTag = (e, { value }) => {

    var letters = /^[0-9a-zA-Z]+$/;
    if (value.match(letters)) {
      this.setState(prevState => {
        prevState.tagOptions.push({key: value, value: value, text: value});
        return {
          tagOptions: prevState.tagOptions
        }
      });
    }

    //ignore if not valid
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
    console.log("XXX", model);
  };

  /**
   * checks to see if this is use based on a member id
   * @param id
   * @returns {boolean}
   */
  isMe(id) {
    let me = MemberClient.me;
    return me && me[CircuitSidebar.idFieldStr] === id;
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

    let panelHeight = DimensionController.getCircuitSidebarHeight();
    if (this.state.tagEditEnabled) {
      panelHeight += DimensionController.getCircuitSidebarTimerHeight() +
        DimensionController.getCircuitSidebarActionsHeight() + 12;
    }

    return (
      <Segment
        className="content"
        inverted
        style={{
          height: panelHeight
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
        CircuitSidebar.wtfTimerId
      );
      this.wtfTimer = UtilRenderer.clearIntervalTimer(
        this.wtfTimer
      );

      if (UtilRenderer.isCircuitTroubleshoot(circuit)) {
        this.wtfTimer = setInterval(() => {
          this.timerEl.innerHTML = UtilRenderer.getWtfTimerFromCircuit(
            circuit
          );
        }, CircuitSidebar.wtfTimerIntervalMs);
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

    let height = "100%";

    if (this.state.tagEditEnabled) {
      height = DimensionController.getCircuitSidebarHeight() +
        DimensionController.getCircuitSidebarTimerHeight() +
        DimensionController.getCircuitSidebarActionsHeight() - 100;
    }

    return (
      <div className="overview" style = {{ height : height}}>
        {this.getTitleContent(title)}
        {this.getDescriptionContent(description)}
        {this.getTagsMapContent(tags)}
        {this.getTagsEditDoneContent()}
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

  getTagsEditDoneContent() {
    if (this.state.tagEditEnabled) {
      return (
        <Label color="violet" size="small" className="tagsDone" onClick={this.onClickTagsDone}>
          <i>Done</i>
        </Label>
      );
    } else return "";
  }


  /**
   * gets our tags content body from our array of tags
   * @param tags
   * @returns {*}
   */
  getTagsMapContent(tags) {

    let tagsContent = "";

    if (this.state.tagEditEnabled) {

      tagsContent = (
        <div><Dropdown className="tagsDropdown"
                       placeholder='Search tags'
                       fluid
                       multiple
                       search
                       selection
                       allowAdditions
                       options={this.state.tagOptions}
                       value={this.state.currentTags}
                       onAddItem={this.handleAddTag}
                       onChange={this.handleChangeForTags}
        />
        </div>
      );


    } else {
      if (this.state.currentTags.length > 0) {
        tagsContent =
          <div>
            {
              this.state.currentTags.map((s, i) => (
                <Label color="grey" size="tiny" key={i} onClick={this.onClickAddTags}>
                  {s}
                </Label>
              ))
            }
            <Label color="grey" size="tiny" key={99999} onClick={this.onClickAddTags}>
              ...
            </Label>
          </div>
      } else {
        tagsContent = <Popup
          content="Click to add tags."
          mouseEnterDelay={420}
          mouseLeaveDelay={210}
          on="hover"
          position={"top center"}
          inverted
          trigger={
            <Label color="red" size="tiny" onClick={this.onClickAddTags}>
              <i>Click to Tag!</i>
            </Label>
          }
        />
      }

    }

    return (
      <Segment inverted className="tags">
        {tagsContent}
      </Segment>
    );
  }

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
          id={CircuitSidebar.wtfTimerId}
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

    if (this.state.tagEditEnabled) {
      return (
        <div>
        </div>
      );
    } else {
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
   * renders our solved button for the gui. disables the button if it is paused
   * @returns {*}
   */
  getSolveActiveCircuitButtonContent() {
    let circuit = this.props.model;
    if (circuit && !UtilRenderer.isCircuitPaused(circuit)) {
      return (
        <Button
          onClick={this.onClickSolveActiveCircuit}
          size="medium"
          color="violet"
        >
          <Button.Content>solved!</Button.Content>
        </Button>
      );
    }
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>solved!</Button.Content>
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
      } else if (UtilRenderer.isCircuitSolved(circuit)) {
        return this.getSolvedCircuitButtonContent();
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
   * renders our solved button which is shown when viewing a circuit
   * that's already been solved. It is disabled and is only shown when the active
   * circuit is actually solved.
   * @returns {*}
   */
  getSolvedCircuitButtonContent() {
    return (
      <Button size="medium" color="grey" disabled>
        <Button.Content>solved</Button.Content>
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

    if (UtilRenderer.isCircuitOwnerModerator(MemberClient.me, circuit)) {

      if (UtilRenderer.isCircuitCanceled(circuit) || UtilRenderer.isCircuitClosed(circuit) || UtilRenderer.isCircuitSolved(circuit)) {
        content = (
          <Grid.Row stretched verticalAlign="middle">
            <Grid.Column>
              {this.getInactiveCircuitButtonContent()}
            </Grid.Column>
          </Grid.Row>
        );
      } else {
        content = (
          <Grid.Row stretched verticalAlign="middle">
            <Grid.Column>
              {this.getSolveActiveCircuitButtonContent()}
            </Grid.Column>
            <Grid.Column>
              {this.getPauseResumeButtonContent()}
            </Grid.Column>
            <Grid.Column>
              {this.getCancelActiveCircuitButtonContent()}
            </Grid.Column>
          </Grid.Row>
        );
      }
    } else {
        //not my circuit
        if (!UtilRenderer.isCircuitActive(this.props.model)) {
          content = (
            <Grid.Row stretched verticalAlign="middle">
              <Grid.Column>
                {this.getInactiveCircuitButtonContent()}
              </Grid.Column>
            </Grid.Row>
          );
        } else {
          //active circuit, not mine
          if (UtilRenderer.isCircuitParticipant(MemberClient.me, this.props.circuitMembers)) {
            content = (
              <Grid.Row stretched verticalAlign="middle">
                <Grid.Column>
                  {this.getLeaveActiveCircuitButtonContent()}
                </Grid.Column>
              </Grid.Row>
            );
          } else {
            content = (
              <Grid.Row stretched verticalAlign="middle">
                <Grid.Column>
                  {this.getJoinActiveCircuitButtonContent()}
                </Grid.Column>
              </Grid.Row>
            );
          }

        }
    }

    if (this.state.tagEditEnabled) {
      return (<div></div>)
    } else {
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
            <PartyPanelListItem
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
