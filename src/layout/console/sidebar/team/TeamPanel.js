import React, { Component } from "react";
import {
  Accordion,
  Menu,
  Segment,
  Transition,
  Message,
  List
} from "semantic-ui-react";
import { DimensionController } from "../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import { TeamClient } from "../../../../clients/TeamClient";
import TeamPanelListItem from "./TeamPanelListItem";
import { MemberClient } from "../../../../clients/MemberClient";

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
      activeIndex: 0,
      activeItem:
        SidePanelViewController.SubmenuSelection.TEAMS,
      teamVisible: false
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
    this.animationType =
      SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay =
      SidePanelViewController.AnimationDelays.SUBMENU;
    this.teams = [];
  }

  /**
   * called when we render the team panel into the gui
   */
  componentDidMount() {
    this.myController.configureTeamPanelListener(
      this,
      this.refreshTeamPanel
    );
    this.refreshTeamPanel();
  }

  /**
   * called to refresh the team panel with new data
   */
  refreshTeamPanel() {
    switch (this.myController.activeTeamSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.TEAMS:
        this.showTeamPanel();
        break;
      default:
        throw new Error(TeamClient.Errors.UNKNOWN);
    }
  }

  /**
   * called to display the team panel in the gui
   */
  showTeamPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.TEAMS,
      teamVisible: true
    });
    TeamClient.getAllMyTeams(this, arg =>
      this.handleClientCallback(arg, arg => {
        this.teams = arg.data;
      })
    );
  }

  /**
   * handles our callback from our TeamClient request
   * @param arg
   * @param callback
   */
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
    this.myController.configureTeamPanelListener(
      this,
      null
    );
  }

  /**
   * updates display to show spirit content
   * @param e
   * @param name
   */
  handleMenuClick = (e, { name }) => {
    // TODO support multiple teams
    // this.myController.changeActiveTeamSubmenuPanel(name);
  };

  /**
   * selects a team member in the list
   * @param member
   * @param isMe
   */
  handleClickRow = member => {
    let name = member.username;
    this.requestBrowserToLoadTeamJournalAndSetActiveMember(
      name
    );
  };

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param teamMember
   */
  requestBrowserToLoadTeamJournalAndSetActiveMember(
    teamMember
  ) {
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
   * gets our team panel content with the team model that was passed in from the props
   * @returns {*}
   */
  getTeamPanelMembersContent() {
    if (this.error) {
      return this.getErrorContent(this.error);
    } else {
      return (
        <div className="teamPanelMembersContent">
          {this.getTeamPanelMembersListContent()}
        </div>
      );
    }
  }

  /**
   * gets our team panel list for our team panel in the sidebar
   * @returns {*}
   */
  getTeamPanelMembersListContent() {
    let panels = this.teams.map((team, i) => {
      return {
        key: `panel-${i}`,
        title: `${team.name}`,
        content: {
          content: this.getTeamPanelListMembersContent(
            team.teamMembers
          )
        }
      };
    });

    return (
      <Accordion
        as={Menu}
        vertical
        defaultActiveIndex={[0]}
        panels={panels}
        exclusive={false}
        fluid
        inverted
      />
    );
  }

  /**
   * generates a list of our teams members for our accordion panel
   * @param members
   * @returns {*}
   */
  getTeamPanelListMembersContent(members) {
    let me = MemberClient.me;
    return (
      <List
        inverted
        divided
        celled
        animated
        verticalAlign="middle"
        size="large"
      >
        <TeamPanelListItem
          key={me.id}
          model={me}
          isMe={true}
          onClickRow={this.handleClickRow}
        />
        {members.map(
          member =>
            me.id !== member.id && (
              <TeamPanelListItem
                key={member.id}
                model={member}
                isMe={false}
                onClickRow={this.handleClickRow}
              />
            )
        )}
      </List>
    );
  }

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;

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
              name="Teams"
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection
                  .TEAMS
              }
              onClick={this.handleMenuClick}
            />
          </Menu>
          <Segment
            inverted
            style={{
              height: DimensionController.getSidebarPanelHeight()
            }}
          >
            <Transition
              visible={this.state.teamVisible}
              animation={this.animationType}
              duration={this.animationDelay}
              unmountOnHide
            >
              {this.getTeamPanelMembersContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
