import React, { Component } from "react";
import { Menu, Segment, Transition, Grid, Message } from "semantic-ui-react";
import TeamMember from "./TeamMember";
import { DimensionController } from "../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import { TeamClient } from "../../../../clients/TeamClient";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class TeamPanel extends Component {
  /**
   * builds the team panel for the renderer
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TeamPanel]";
    this.state = {
      teamVisible: false
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
    this.animationType = SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay = SidePanelViewController.AnimationDelays.SUBMENU;
    this.me = this.getDefaultMe();
    this.members = [];
    this.selected = this.me;
  }

  getDefaultMe() {
    return {
      displayName: SidePanelViewController.ME,
      id: SidePanelViewController.ID
    };
  }

  /**
   * called when we render the team panel into the gui
   */
  componentDidMount() {
    this.myController.configureTeamPanelListener(this, this.refreshTeamPanel);
    this.refreshTeamPanel();
  }

  /**
   * called to refresh the team panel with new data
   */
  refreshTeamPanel() {
    switch (this.myController.activeTeamSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.TEAM:
        this.showTeamPanel();
        break;
      default:
        throw new Error("Unknown team panel menu item");
    }
  }

  /**
   * called to display the team panel in the gui
   */
  showTeamPanel() {
    this.setState({
      teamVisible: true
    });
    TeamClient.getMyTeam("primary", "", this, arg =>
      this.handleClientCallback(arg, arg => {
        this.myTeam = arg.data[0];
      })
    );
    TeamClient.getMyCurrentStatus(this, arg =>
      this.handleClientCallback(arg, arg => {
        this.me = arg.data[0];
      })
    );
  }

  handleClientCallback = (arg, callback) => {
    if (arg.error) {
      this.error = arg.error;
      this.forceUpdate();
    } else {
      this.error = null;
      if (callback) {
        callback(arg);
      }
      this.forceUpdate();
    }
  };

  /**
   * called when removing the component from the gui. removes any associated listeners for
   * memory management
   */
  componentWillUnmount() {
    this.myController.configureTeamPanelListener(this, null);
  }

  /**
   * updates display to show spirit content
   * @param e
   * @param name
   */
  handleClick = (e, { name }) => {
    this.myController.changeActiveTeamSubmenuPanel(name);
  };

  /**
   * selects a team member in the list
   * @param id
   * @param teamMember
   */
  selectRow = (id, member) => {
    console.log(
      this.name + " - Team member clicked!" + member.name + "id = " + id
    );
    this.selected = member;
    this.requestBrowserToLoadTeamJournalAndSetActiveMember(
      member.userName
    );
  };

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param teamMember
   */
  requestBrowserToLoadTeamJournalAndSetActiveMember(teamMember) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.TEAM,
      teamMember
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * renders some error content is things fuck up
   * @param message
   * @returns {*}
   */
  getErrorContent(message) {
    return (
      <div className="error">
        <Message negative>
          <Message.Header>Error:</Message.Header>
          <p>{message}</p>
        </Message>
      </div>
    );
  }

  /**
   * renders ourself into the team gui grid
   * @returns {*}
   */
  getTeamMemberMeContent() {
    return (
      <TeamMember
        key={this.me.id}
        id={this.me.id}
        displayName={this.me.displayName + " (you)"}
        name={this.me.name}
        activeStatus={this.me.activeStatus}
        statusColor={this.me.statusColor}
        activeTaskName={this.me.activeTaskName}
        activeTaskSummary={this.me.activeTaskSummary}
        workingOn={this.me.workingOn}
        isAlarmTriggered={this.me.isAlarmTriggered}
        wtfTimer={this.me.wtfTimer}
        alarmStatusMessage={this.me.alarmStatusMessage}
        level={this.me.level}
        xpRequired={this.me.xpRequired}
        onSetActiveRow={this.selectRow}
        teamMember={this.me}
        activeTeamMember={this.selected}
      />
    );
  }

  /**
   * renders our other team member content in the gui grid
   * @param member
   * @returns {*}
   */
  getTeamMembersOtherContent(member) {
    return (
      <TeamMember
        key={member.id}
        id={member.id}
        displayName={member.displayName}
        name={member.name}
        activeStatus={member.activeStatus}
        statusColor={member.statusColor}
        activeTaskName={member.activeTaskName}
        activeTaskSummary={member.activeTaskSummary}
        workingOn={member.workingOn}
        isAlarmTriggered={member.isAlarmTriggered}
        wtfTimer={member.wtfTimer}
        alarmStatusMessage={member.alarmStatusMessage}
        level={member.level}
        xpRequired={member.xpRequired}
        onSetActiveRow={this.selectRow}
        teamMember={member}
        activeTeamMember={this.selected}
      />
    );
  }

  /**
   * gets our team panel content with the team model that was passed in from the props
   * @returns {*}
   */
  getTeamMembersContent() {
    if (this.error) {
      return this.getErrorContent(this.error);
    } else {
      return (
        <div>
          <Grid inverted>
            {this.getTeamMemberMeContent()}
            {this.members.map(member =>
              this.getTeamMembersOtherContent(member)
            )}
          </Grid>
        </div>
      );
    }
  }

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let teamName = this.myTeam ? this.myTeam.name : "loading...";
    return (
      <div
        id="component"
        className="consoleSidebarPanel teamPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name={teamName}
              active={true}
              onClick={this.handleClick}
            />
          </Menu>
          <Segment
            inverted
            style={{ height: DimensionController.getSidebarPanelHeight() }}
          >
            <Transition
              visible={this.state.teamVisible}
              animation={this.animationType}
              duration={this.animationDelay}
              unmountOnHide
            >
              {this.getTeamMembersContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
