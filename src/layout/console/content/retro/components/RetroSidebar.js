import React, { Component } from "react";
import {
  Button,
  Grid,
  Label,
  List,
  Menu,
  Popup,
  Segment,
  Dropdown,
} from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import RetroPartyListItem from "./RetroPartyListItem";
import { MemberClient } from "../../../../../clients/MemberClient";
import UtilRenderer from "../../../../../UtilRenderer";
import { CircuitClient } from "../../../../../clients/CircuitClient";

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
   * the possible view we can display in the circuit sidebar panel
   * @returns {{PARTY: string, METRICS: string, OVERVIEW: string}}
   * @constructor
   */
  static get Views() {
    return {
      OVERVIEW: "overview",
      PARTY: "party",
      FILES: "files",
      EXEC: "exec",
    };
  }

  /**
   * builds our circuit sidebar
   * @param props
   */
  constructor(props) {
    super(props);

    this.resourcesController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );

    this.state = {
      activeMenuView: RetroSidebar.Views.OVERVIEW,
      tagEditEnabled: false,
      currentTags: [],
      tagOptions: [],
    };
    this.props.set(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.resource.uri !== this.props.resource.uri
    ) {
      this.setState({
        activeMenuView: RetroSidebar.Views.OVERVIEW,
      });
      this.props.toggleTroubleshootPanel();
    }

    if (
      (!prevProps.model && this.props.model) ||
      (prevProps.model &&
        this.props.model &&
        prevProps.model.circuitName !==
          this.props.model.circuitName)
    ) {
      let currentTags = [];

      if (this.props.model.tags) {
        for (
          let i = 0;
          i < this.props.model.tags.length;
          i++
        ) {
          let tag = this.props.model.tags[i];
          currentTags.push(tag);
        }
      }

      this.setState({
        currentTags: currentTags,
        tagEditEnabled: false,
      });
    }

    if (
      prevProps.dictionaryWords.length !==
      this.props.dictionaryWords.length
    ) {
      let tagOptions = [];

      for (
        let i = 0;
        i < this.props.dictionaryWords.length;
        i++
      ) {
        let word = this.props.dictionaryWords[i];

        tagOptions.push({
          key: word.wordName,
          value: word.wordName,
          text: word.wordName,
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
    this.resourcesController.closeRetro(circuitName);
  };

  /**
   * click handler for adding tags to a circuit
   */
  onClickAddTags = () => {
    console.log("Add tags clicked!");
    this.setState({
      tagEditEnabled: true,
    });
  };

  /**
   * click handler for adding tags to a circuit
   */
  onClickTagsDone = () => {
    console.log("Tags done!");
    this.setState({
      tagEditEnabled: false,
    });

    CircuitClient.saveTags(
      this.props.model.circuitName,
      this.state.currentTags,
      this,
      (arg) => {
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
      currentTags: cleanVals,
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
      this.setState((prevState) => {
        prevState.tagOptions.push({
          key: value,
          value: value,
          text: value,
        });
        return {
          tagOptions: prevState.tagOptions,
        };
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
      activeMenuView: name,
    });
  };

  /**
   * custom event handler for when a user clicks on the files menu item
   * @param e
   * @param arg
   */
  handleMenuFilesClick = (e, arg) => {
    this.handleMenuClick(e, arg);
    this.props.toggleFilesPanel();
  };

  /**
   * custom event handler for when a user clicks on the exec menu item
   * @param e
   * @param arg
   */
  handleMenuExecClick = (e, arg) => {
    this.handleMenuClick(e, arg);
    this.props.toggleExecPanel();
  };

  /**
   * custom event handler for when a user clicks on the overview menu item
   * @param e
   * @param arg
   */
  handleMenuOverviewClick = (e, arg) => {
    this.handleMenuClick(e, arg);
    this.props.toggleTroubleshootPanel();
  };

  /**
   * selects a team member in the list
   * @param model
   */
  handleClickRow = (model) => {
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
    let panelHeight =
      DimensionController.getCircuitSidebarHeight();
    if (this.state.tagEditEnabled) {
      panelHeight +=
        DimensionController.getCircuitSidebarTimerHeight() +
        DimensionController.getCircuitSidebarActionsHeight() +
        12;
    }

    return (
      <Segment
        className="content"
        inverted
        style={{
          height: panelHeight,
        }}
      >
        <Menu size="mini" inverted pointing secondary>
          <Menu.Item
            name={RetroSidebar.Views.OVERVIEW}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.OVERVIEW
            }
            onClick={this.handleMenuOverviewClick}
          />
          <Menu.Item
            name={RetroSidebar.Views.FILES}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.FILES
            }
            onClick={this.handleMenuFilesClick}
          />
          <Menu.Item
            name={RetroSidebar.Views.EXEC}
            active={
              this.state.activeMenuView ===
              RetroSidebar.Views.EXEC
            }
            onClick={this.handleMenuExecClick}
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
      case RetroSidebar.Views.FILES:
        return this.getCircuitSidebarFilesContent();
      case RetroSidebar.Views.EXEC:
        return this.getCircuitSidebarExecContent();
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
          this.timerEl.innerHTML =
            UtilRenderer.getWtfTimerFromCircuit(circuit);
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

    let height = "100%";

    if (this.state.tagEditEnabled) {
      height =
        DimensionController.getCircuitSidebarHeight() +
        DimensionController.getCircuitSidebarTimerHeight() +
        DimensionController.getCircuitSidebarActionsHeight() -
        100;
    }

    return (
      <div className="overview" style={{ height: height }}>
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
        <Label
          color="violet"
          size="small"
          className="tagsDone"
          onClick={this.onClickTagsDone}
        >
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
        <div>
          <Dropdown
            className="tagsDropdown"
            placeholder="Search tags"
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
        tagsContent = (
          <div>
            {this.state.currentTags.map((s, i) => (
              <Label
                color="grey"
                size="tiny"
                key={i}
                onClick={this.onClickAddTags}
              >
                {s}
              </Label>
            ))}
            <Label
              color="grey"
              size="tiny"
              key={99999}
              onClick={this.onClickAddTags}
            >
              ...
            </Label>
          </div>
        );
      } else {
        tagsContent = (
          <Popup
            content="Click to add tags."
            mouseEnterDelay={420}
            mouseLeaveDelay={210}
            on="hover"
            position={"top center"}
            inverted
            trigger={
              <Label
                color="red"
                size="tiny"
                onClick={this.onClickAddTags}
              >
                <i>Click to Tag!</i>
              </Label>
            }
          />
        );
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
      <Label color="red" basic className="retrotime">
        <span className="time" id={RetroSidebar.wtfTimerId}>
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
   * renders our sidebar metrics content panel
   * @returns {*}
   */
  getCircuitSidebarFilesContent() {
    if (!this.props.chartDto) {
      return <div></div>;
    }

    let fileData =
      this.props.chartDto.featureSetsByType[
        UtilRenderer.FILE_DATA
      ];

    let rowCount = fileData.rowsOfPaddedCells.length;

    let allBoxes = [];

    fileData.rowsOfPaddedCells.forEach((row) => {
      allBoxes.push(row[0]);
    });

    let uniqueBoxCount = new Set(allBoxes).size;

    return (
      <div>
        <Segment className="metricSummary" inverted>
          <i>
            Viewed {rowCount} files, across {uniqueBoxCount}{" "}
            boxes, while troubleshooting this issue.
          </i>
        </Segment>
      </div>
    );
  }

  /**
   * renders our sidebar metrics content panel
   * @returns {*}
   */
  getCircuitSidebarExecContent() {
    if (!this.props.chartDto) {
      return <div></div>;
    }

    let execData =
      this.props.chartDto.featureSetsByType[
        UtilRenderer.EXEC_DATA
      ];

    let rowCount = execData.rowsOfPaddedCells.length;

    let allCounts = [];

    execData.rowsOfPaddedCells.forEach((row) => {
      allCounts.push(row[5].trim());
    });

    let totalRuns = 0;
    for (let i = 0; i < allCounts.length; i++) {
      totalRuns += parseInt(allCounts[i], 10);
    }

    return (
      <div>
        <Segment className="metricSummary" inverted>
          <i>
            Ran {rowCount} unique tests, {totalRuns} cycles,
            while troubleshooting this issue.
          </i>
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
      return <div></div>;
    } else {
      return (
        <Segment
          className="timer"
          inverted
          style={{
            height:
              DimensionController.getCircuitSidebarTimerHeight(),
          }}
        >
          {this.getWtfTimerContent()}
        </Segment>
      );
    }
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
      } else if (
        UtilRenderer.isCircuitTroubleshoot(circuit)
      ) {
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
   * renders the circuit sidebar actions segment
   * @returns {*}
   */
  getCircuitSidebarActions() {
    let circuit = this.props.model;

    let content = "";

    //for a solved circuit, anyone on the team, whether the owner or not, can start a retro
    //if they hit the close button, it should mark for close, and show number of marks.

    //need to know whether the close is marked by them or not already?

    if (
      circuit &&
      UtilRenderer.isMarkedForCloseByMe(
        circuit,
        MemberClient.me
      ) &&
      !UtilRenderer.isCircuitClosed(circuit)
    ) {
      content = (
        <Grid.Row stretched verticalAlign="middle">
          <Grid.Column>
            <Button size="medium" color="grey" disabled>
              <Button.Content>
                waiting for team (
                {circuit.memberMarksForClose.length})
              </Button.Content>
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

      if (
        UtilRenderer.isCircuitCanceled(circuit) ||
        UtilRenderer.isCircuitClosed(circuit) ||
        UtilRenderer.isCircuitTroubleshoot(circuit) ||
        UtilRenderer.isCircuitPaused(circuit)
      ) {
        content = (
          <Grid.Row stretched verticalAlign="middle">
            <Grid.Column>
              {this.getInactiveCircuitButtonContent()}
            </Grid.Column>
          </Grid.Row>
        );
      }
    }

    if (this.state.tagEditEnabled) {
      return <div></div>;
    } else {
      return (
        <Segment
          className="actions"
          inverted
          style={{
            height:
              DimensionController.getCircuitSidebarActionsHeight(),
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
          {circuitMembers.map((model) => (
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
