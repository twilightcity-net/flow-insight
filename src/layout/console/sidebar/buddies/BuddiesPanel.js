import React, {Component} from "react";
import {Icon, Input, List, Menu, Message, Popup, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";
import {MemberClient} from "../../../../clients/MemberClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import {BaseClient} from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";
import BuddiesPanelListItem from "./BuddiesPanelListItem";
import {FervieClient} from "../../../../clients/FervieClient";
import PendingBuddyListItem from "./PendingBuddyListItem";

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
    this.me = MemberClient.me;
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
    this.talkDirectMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_CLIENT,
        this,
        this.onTalkDirectMessage
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
   * from our talk network. This panel is looking for buddy member updates,
   * or pending buddy updates
   * @param event
   * @param arg
   */
  onTalkDirectMessage = (event, arg) => {
    let mType = arg.messageType,
      data = arg.data;

    if (mType === BaseClient.MessageTypes.PENDING_BUDDY_REQUEST) {
      this.setState((prevState) => {
        prevState.pendingBuddies.push(data);
        return {
          pendingBuddies: prevState.pendingBuddies
        };
      });
    } else if (mType === BaseClient.MessageTypes.BUDDY_STATUS_EVENT) {
      this.setState((prevState) => {
        for (let buddy of prevState.buddies) {
          if (buddy.sparkId === data.buddy.sparkId ) {
            Object.assign(buddy, data.buddy);
            break;
          }
        }
        return {
          buddies: prevState.buddies
        };
      });
    }
  };

  /**
   * called when we render the buddy panel into the gui
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
   * called to refresh the buddy panel with new data
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
    this.talkDirectMessageListener.clear();
    this.buddiesDataRefreshListener.clear();
  }

  /**
   * updates display when you click on a buddy item
   * @param e
   * @param name
   */
  handleMenuClick = (e, { name }) => {
    //menu click here
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
        {this.state.pendingBuddies.map((request) => {
          return (
            <PendingBuddyListItem
              key={request.buddyRequestId}
              model={request}
            />
          );
        })
        }
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

    let me = MemberClient.me;

    if (!me) {
      return "";
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
