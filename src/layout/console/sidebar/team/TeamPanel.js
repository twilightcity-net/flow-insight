import React, { Component } from "react";
import { Menu, Segment, Transition, Message, List } from "semantic-ui-react";
import { DimensionController } from "../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import { TeamClient } from "../../../../clients/TeamClient";
import TeamPanelListItem from "./TeamPanelListItem";

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
      activeItem: SidePanelViewController.SubmenuSelection.TEAM,
      teamVisible: false
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
    this.animationType = SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay = SidePanelViewController.AnimationDelays.SUBMENU;
    this.me = this.getDefaultMe();
    this.myTeam = {};
    this.members = [];
  }

  /**
   * make sure we don't update when we aren't changing.
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.me.id !== this.me.displayName;
  }

  /**
   * creates a default member object for loading purposes
   * @returns {{displayName: string, id: string}}
   */
  getDefaultMe() {
    return {
      displayName: SidePanelViewController.ME,
      id: SidePanelViewController.ME
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
        throw new Error(TeamClient.Errors.UNKNOWN);
    }
  }

  /**
   * called to display the team panel in the gui
   */
  showTeamPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.TEAM,
      teamVisible: true
    });
    TeamClient.getMyTeam(
      TeamClient.Strings.PRIMARY,
      TeamClient.Strings.EMPTY,
      this,
      arg =>
        this.handleClientCallback(arg, arg => {
          this.myTeam = arg.data[0];
        })
    );
    TeamClient.getMyCurrentStatus(this, arg =>
      this.handleClientCallback(arg, arg => {
        this.me = arg.data[0];
      })
    );
    TeamClient.getStatusOfMeAndMyTeam(this, arg =>
      this.handleClientCallback(arg, arg => {
        this.members = arg.data;
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
    this.myController.configureTeamPanelListener(this, null);
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
    let name =
      this.me.id === member.id ? TeamClient.Strings.ME : member.userName;
    this.requestBrowserToLoadTeamJournalAndSetActiveMember(name);
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
   * gets our team panel content with the team model that was passed in from the props
   * @returns {*}
   */
  getTeamPanelMembersContent() {
    if (this.error) {
      return this.getErrorContent(this.error);
    } else {
      return (
        <div className="teamPanelMembersContent">
          {this.getTeamPanelMembersListContent(this.me, this.members)}
        </div>
      );
    }
  }

  /**
   * gets our team panel list for our team panel in the sidebar
   * @param me
   * @param members
   * @returns {*}
   */
  getTeamPanelMembersListContent(me, members) {
    return (
      <List
        inverted
        divided
        celled
        animated
        verticalAlign="middle"
        size="large"
      >
        {me.id !== me.displayName && (
          <TeamPanelListItem
            key={me.id}
            model={me}
            isMe={true}
            onClickRow={this.handleClickRow}
          />
        )}
        {members.map(
          model =>
            model.id !== me.id && (
              <TeamPanelListItem
                key={model.id}
                model={model}
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
    let teamName = this.myTeam ? this.myTeam.name : TeamClient.Strings.LOADING,
      { activeItem } = this.state;

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
              active={
                activeItem === SidePanelViewController.SubmenuSelection.TEAM
              }
              onClick={this.handleMenuClick}
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
              {this.getTeamPanelMembersContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
