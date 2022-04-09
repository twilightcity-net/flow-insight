import React, { Component } from "react";
import {
  Accordion,
  Menu,
  Segment,
  Transition,
  Message,
  List,
} from "semantic-ui-react";
import { DimensionController } from "../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import { TeamClient } from "../../../../clients/TeamClient";
import TeamPanelListItem from "./TeamPanelListItem";
import { MemberClient } from "../../../../clients/MemberClient";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";
import { BaseClient } from "../../../../clients/BaseClient";
import { BrowserController } from "../../../../controllers/BrowserController";
import UtilRenderer from "../../../../UtilRenderer";

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
      teamVisible: false,
      teams: [],
      orgName: TeamClient.orgName,
    };
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR
      );
    this.lastClickedUser = null;
    this.animationType =
      SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay =
      SidePanelViewController.AnimationDelays.SUBMENU;
    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.teamDataRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TEAM_DATA_REFRESH,
        this,
        this.onTeamDataRefresh
      );
  }

  /**
   * event handler that is called whenever we receive a talk message
   * from our talk network. This panel is looking for team member updates
   * and will loop over all of the known teams looking for the specific
   * team member to update. yay!
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    let mType = arg.messageType,
      data = arg.data;
    let teams = this.state.teams;

    if (mType === BaseClient.MessageTypes.TEAM_MEMBER) {
      for (let i = 0; i < teams.length; i++) {
        teams[i].teamMembers = this.updateTeamMembers(
          teams[i].teamMembers,
          data
        );
      }
      this.setState({
        teams: teams,
      });
    } else if (
      mType === BaseClient.MessageTypes.TEAM_MEMBER_ADDED
    ) {
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].id === data.teamId) {
          teams[i].teamMembers = this.addTeamMemberToList(
            teams[i].teamMembers,
            data
          );
          break;
        }
      }
      this.setState({
        teams: teams,
      });
    } else if (
      mType === BaseClient.MessageTypes.TEAM_MEMBER_REMOVED
    ) {
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].id === data.teamId) {
          if (data.memberId === MemberClient.me.id) {
            this.refreshTeamPanel();
          } else {
            teams[i].teamMembers =
              this.removeTeamMemberFromList(
                teams[i].teamMembers,
                data
              );
            this.setState({
              teams: teams,
            });
          }

          break;
        }
      }
    }
  };

  /**
   * updates our team members list by adding a new member that just joined
   * @param teamMembers
   * @param teamMemberAddedDto
   * @returns {*}
   */
  addTeamMemberToList(teamMembers, teamMemberAddedDto) {
    teamMembers.push(teamMemberAddedDto.teamMemberDto);
    teamMembers = this.sortTeamMembers(teamMembers);

    return teamMembers;
  }

  /**
   * Remove a team member from a team member list
   * @param teamMembers
   * @param teamMemberAddedDto
   * @returns {*}
   */
  removeTeamMemberFromList(
    teamMembers,
    teamMemberRemovedDto
  ) {
    for (let i = 0; i < teamMembers.length; i++) {
      if (
        teamMembers[i].id === teamMemberRemovedDto.memberId
      ) {
        teamMembers.splice(i, 1);
      }
    }

    return teamMembers;
  }

  /**
   * updates our team members with our components state so that the tiny red light
   * goes on. This is a result of many thousands of lines of code in order to make
   * this light turn on. It is control via our talk network which is distributed over
   * a peer to peer grid.
   * @param teamMembers
   * @param teamMember
   * @returns {*}
   */
  updateTeamMembers(teamMembers, teamMember) {
    let statusChange = false;

    for (let i = 0; i < teamMembers.length; i++) {
      if (teamMembers[i].id === teamMember.id) {
        if (
          teamMembers[i].onlineStatus !==
            teamMember.onlineStatus ||
          (teamMembers[i].activeCircuit === null &&
            teamMember.activeCircuit !== null) ||
          (teamMembers[i].activeCircuit !== null &&
            teamMember.activeCircuit === null)
        ) {
          //online/offline or alarm status change
          statusChange = true;
        }
        teamMembers[i] = teamMember;

        break;
      }
    }

    if (statusChange) {
      teamMembers = this.sortTeamMembers(teamMembers);
    }

    return teamMembers;
  }

  sortTeamMembers(teamMembers) {
    //you are always at the top.
    //then, red lights
    //then, purple lights
    //then, green lights
    //then offline
    let myId = MemberClient.me.id;

    let team = teamMembers.sort((a, b) => {
      let aIsOnline = UtilRenderer.isMemberOnline(a);
      let bIsOnline = UtilRenderer.isMemberOnline(b);

      if (a.id === myId && b.id !== myId) {
        return -1;
      } else if (b.id === myId && a.id !== myId) {
        return 1;
      }

      if (aIsOnline && !bIsOnline) {
        return -1;
      } else if (bIsOnline && !aIsOnline) {
        return 1;
      } else if (aIsOnline && bIsOnline) {
        if (a.activeCircuit && !b.activeCircuit) {
          return -1;
        } else if (b.activeCircuit && !a.activeCircuit) {
          return 1;
        }
        if (a.activeCircuit && b.activeCircuit) {
          let aIsHelping = UtilRenderer.isMemberHelping(a);
          let bIsHelping = UtilRenderer.isMemberHelping(b);
          if (!aIsHelping && bIsHelping) {
            return -1;
          } else if (aIsHelping && !bIsHelping) {
            return 1;
          }
        }

        if (a.displayName < b.displayName) {
          return -1;
        } else if (a.displayName > b.displayName) {
          return 1;
        }
      }
      return 0;
    });

    return team;
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
   * Force refresh the team data manually on triggering event.  This is called after the connection
   * goes stale, and reconnects again.  Since we lost messages, easiest way to resync is to refresh again
   */
  onTeamDataRefresh() {
    this.refreshTeamPanel();
  }

  /**
   * called to refresh the team panel with new data
   */
  refreshTeamPanel() {
    if (this.state.orgName == null) {
      TeamClient.getActiveOrg(this, (arg) => {
        if (arg.error) {
          this.error = arg.error;
        } else {
          this.error = null;
          this.setState({
            orgName: arg.data.orgName,
          });
        }
      });
    }

    TeamClient.getAllMyTeams(this, (arg) => {
      if (arg.error) {
        this.error = arg.error;
      } else {
        this.error = null;
        this.setState({
          activeItem:
            SidePanelViewController.SubmenuSelection.TEAMS,
          teamVisible: true,
          teams: this.sortAllTeams(arg.data),
        });
      }
    });
  }

  sortAllTeams(teams) {
    for (let i = 0; i < teams.length; i++) {
      teams[i].teamMembers = this.sortTeamMembers(
        teams[i].teamMembers
      );
    }
    return teams;
  }

  /**
   * called when removing the component from the gui. removes any associated listeners for
   * memory management
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
    this.teamDataRefreshListener.clear();
    this.myController.configureTeamPanelListener(
      this,
      null
    );
  }

  /**
   * updates display to show fervie content
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
   */
  handleClickRow = (member) => {
    let name = member.username,
      activeCircuit = member.activeCircuit,
      uri = BrowserController.uri + "";

    if (
      this.lastClickedUser &&
      this.lastClickedUser === name
    ) {
      if (
        activeCircuit &&
        uri.startsWith(
          BrowserRequestFactory.ROOT_SEPARATOR +
            BrowserRequestFactory.Requests.JOURNAL
        )
      ) {
        this.requestBrowserToLoadTeamMemberActiveCircuit(
          activeCircuit.circuitName
        );
      } else {
        this.requestBrowserToLoadTeamJournalAndSetActiveMember(
          name
        );
      }
    } else {
      if (activeCircuit) {
        this.requestBrowserToLoadTeamMemberActiveCircuit(
          activeCircuit.circuitName
        );
      } else {
        this.requestBrowserToLoadTeamJournalAndSetActiveMember(
          name
        );
      }
    }

    this.lastClickedUser = name;
  };

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param teamMember
   */
  requestBrowserToLoadTeamJournalAndSetActiveMember(
    teamMember
  ) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.JOURNAL,
      teamMember
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * creates a new request to load the active circuit
   * @param circuitName
   */
  requestBrowserToLoadTeamMemberActiveCircuit(circuitName) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.CIRCUIT,
      circuitName
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
    let showOffline = false,
      panels = this.state.teams.map((team, i) => {
        showOffline = UtilRenderer.isEveryoneTeam(team);
        return {
          key: `panel-${i}`,
          title: `${team.name}`,
          content: {
            content: this.getTeamPanelListMembersContent(
              team.teamMembers,
              showOffline
            ),
          },
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
   * generates a list of our teams members for our accordion panel, pass in true for show
   * offline members for the param showOffline
   * @param members
   * @param showOffline
   * @returns {*}
   */
  getTeamPanelListMembersContent(members, showOffline) {
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
          (member) =>
            me.id !== member.id &&
            (showOffline ||
              UtilRenderer.isMemberOnline(member)) && (
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

    let houseTitle = "Teams";

    if (this.state.orgName != null) {
      houseTitle = this.state.orgName + " Teams";
    }

    return (
      <div
        id="component"
        className="consoleSidebarPanel teamPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity,
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name={houseTitle}
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
              height:
                DimensionController.getSidebarPanelHeight(),
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
