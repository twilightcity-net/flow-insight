import React, {Component} from "react";
import {Icon, Input, Label, List, Menu, Message, Popup, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";
import {TeamClient} from "../../../../clients/TeamClient";
import {MemberClient} from "../../../../clients/MemberClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import {BaseClient} from "../../../../clients/BaseClient";
import {BrowserController} from "../../../../controllers/BrowserController";
import UtilRenderer from "../../../../UtilRenderer";
import BuddiesPanelListItem from "./BuddiesPanelListItem";
import {FervieClient} from "../../../../clients/FervieClient";

/**
 * this component is the buddies side panel content
 */
export default class BuddiesPanel extends Component {
  /**
   * builds the buddies panel for the renderer
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[BuddiesPanel]";
    this.state = {
      activeIndex: 0,
      activeItem: SidePanelViewController.SubmenuSelection.BUDDIES,
      buddies: [],
      pendingBuddies: [],
      currentEmailValue: "",
      emailErrorFeedback: "",
    };
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR
      );
    this.lastClickedUser = null;
    this.animationType = SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay = SidePanelViewController.AnimationDelays.SUBMENU;
    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.buddiesDataRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.BUDDIES_DATA_REFRESH,
        this,
        this.onBuddiesDataRefresh
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
    } else if (mType === BaseClient.MessageTypes.TEAM_MEMBER_ADDED) {
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
    } else if (mType === BaseClient.MessageTypes.TEAM_MEMBER_REMOVED) {
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].id === data.teamId) {
          if (data.memberId === MemberClient.me.id) {
            this.refreshBuddiesPanel();
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
  removeTeamMemberFromList(teamMembers, teamMemberRemovedDto) {
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
    console.log("Buddies panel mounted!");
    this.refreshBuddiesPanel();
  }

  /**
   * Force refresh the buddies data manually on triggering event.  This is called after the connection
   * goes stale, and reconnects again.  Since we lost messages, easiest way to resync is to refresh again
   */
  onBuddiesDataRefresh() {
    this.refreshBuddiesPanel();
  }

  /**
   * called to refresh the team panel with new data
   */
  refreshBuddiesPanel() {
    console.log("refresh!");

    let callCount = 0;
    FervieClient.getPendingBuddyList(this, (arg) => {
      callCount++;
      this.pendingBuddies = arg.data;
      this.handleDataLoadFinished(callCount, arg);

    });
    FervieClient.getBuddyList(this, (arg) => {
      callCount++;
      this.buddies = arg.data;
      this.handleDataLoadFinished(callCount, arg);
    });
  }

  handleDataLoadFinished(callCount, arg) {
    if (arg.error) {
      console.error("Error during buddy data load: "+arg.error);
    }

    if (callCount !== 2) return;

    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.BUDDIES,
      buddies: this.buddies,
      pendingBuddies: this.pendingBuddies
    });
  }

  /**
   * called when removing the component from the gui. removes any associated listeners for
   * memory management
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
    this.buddiesDataRefreshListener.clear();
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
   * selects a member in the list and opens the journal
   * @param member
   */
  handleClickRow = (member) => {
    let name = member.username;

    if (this.lastClickedUser && this.lastClickedUser === name) {
        this.requestBrowserToLoadTeamJournalAndSetActiveMember(name);
    }

    this.lastClickedUser = name;
  };

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param memberUsername
   */
  requestBrowserToLoadTeamJournalAndSetActiveMember(memberUsername) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.JOURNAL,
      memberUsername
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
  getBuddyPanelContent() {
    if (this.error) {
      return this.getErrorContent(this.error);
    } else {
      return (
        <div className="teamPanelMembersContent">
          {this.getPendingBuddyListContent()}
          {this.getBuddyListContent()}
        </div>
      );
    }
  }

  /**
   * gets our buddy list for our buddy panel in the sidebar
   * @returns {*}
   */
  getBuddyListContent() {
    let showOffline = true;

    //TODO get the list of buddies... need to update this to display from fervie dtos...
    //these have online status, my fervie dtos don't, the current API isn't going to work......
    //maybe I should just return our "team member dtos" here.

    //current uses username/display name we need to use our fervie name on this list.

    //maybe our fervie name should change our display name?

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
        <BuddiesPanelListItem
          key={me.id}
          model={me}
          meUsername={me.username}
          isMe={true}
          onClickRow={this.handleClickRow}
        />
        {this.state.buddies.map(
          (member) =>
            me.id !== member.id &&
            (showOffline || UtilRenderer.isMemberOnline(member)) && (
              <BuddiesPanelListItem
                key={member.id}
                meUsername={me.username}
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
   * gets our pending buddy list for our buddy panel in the sidebar
   * @returns {*}
   */
  getPendingBuddyListContent() {
    let showOffline = true;

    //TODO get

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
        <BuddiesPanelListItem
          key={me.id}
          model={me}
          meUsername={me.username}
          isMe={true}
          onClickRow={this.handleClickRow}
        />
        {members.map(
          (member) =>
            me.id !== member.id &&
            (showOffline || UtilRenderer.isMemberOnline(member)) && (
              <BuddiesPanelListItem
                key={member.id}
                meUsername={me.username}
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
   * Sends a buddy invite request and adds a pending request to the buddy list
   * @param email
   */
  sendInviteRequest(email) {
    console.log("Sending request!");
    FervieClient.inviteToBuddyList(email, this, (arg) => {
      if (arg.error) {
        console.error(arg.error);
        this.setState({
          emailErrorFeedback: arg.error
        });
      } else {
        console.log("Buddy invite sent");
      }
    });
  }

  /**
   * Basic validation to make sure the email matches anything@anything.anything
   * and doesnt include multiple @ signs
   * @param email
   * @returns {boolean}
   */
  isValidEmail(email) {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Handle pressing enter in the email box
   * @param e
   */
  handleKeyPressForEmail = (e) => {
    if (e.charCode === 13) {
      if (this.isValidEmail(this.state.currentEmailValue)) {
        this.sendInviteRequest(this.state.currentEmailValue);
        this.setState({
          currentEmailValue: ""
        });
      } else {
        this.setState({
          emailErrorFeedback: "Invalid email"
        });
      }
    }
  };

  /**
   * handle changing the value of the email input box
   * @param e - the event that was generated by user gui event
   * @param value
   */
  handleChangeForEmail = (e, { value }) => {
    this.setState({
      currentEmailValue: value,
      emailErrorFeedback: ""
    });
  };

  onCloseBuddyInvite = () => {
    this.setState({
      currentEmailValue: "",
      emailErrorFeedback: ""
    });
  }


  getAddBuddyButton() {
    return (<Popup
      position={"bottom center"}
      className={"invitePopup"}
      basic
      inverted
      trigger={<Icon className={"addIcon"} inverted name="plus circle"/>}
      on='click'
      closeOnDocumentClick={true}
      onClose={this.onCloseBuddyInvite}
    >
      <Popup.Content>
        <div className="inviteTitle">
        Invite Buddies to WatchMoovies
        </div>
        <div className="inviteEmailInput">
        <Input
          id="inviteEmailInput"
          fluid
          inverted
          autoFocus
          placeholder={"email address"}
          value={this.state.currentEmailValue}
          onKeyPress={this.handleKeyPressForEmail}
          onChange={this.handleChangeForEmail}
        />
        </div>
        <div className="errorFeedback">&nbsp;{this.state.emailErrorFeedback}</div>
      </Popup.Content>
    </Popup>);
  }

  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;

    let houseTitle = "Moovie Buddies";


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
              active={activeItem === SidePanelViewController.SubmenuSelection.BUDDIES}
              onClick={this.handleMenuClick}
            />
            {this.getAddBuddyButton()}

          </Menu>
          <Segment
            inverted
            style={{
              height: DimensionController.getSidebarPanelHeight(),
            }}
          >
            <Transition
              visible={this.state.teamVisible}
              animation={this.animationType}
              duration={this.animationDelay}
              unmountOnHide
            >
              {this.getBuddyPanelContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
