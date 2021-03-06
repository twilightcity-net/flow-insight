import React, {Component} from "react";
import {List, Menu, Message, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {MemberClient} from "../../../../clients/MemberClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import {BaseClient} from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";
import BuddiesPanelListItem from "./BuddiesPanelListItem";
import {FervieClient} from "../../../../clients/FervieClient";
import PendingBuddyListItem from "./PendingBuddyListItem";
import InviteMemberPopup from "./InviteMemberPopup";
import {AccountClient} from "../../../../clients/AccountClient";

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

    this.globalHudInputLockNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.GLOBAL_HUD_INPUT_LOCK,
        this
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
          buddies: this.sortBuddies(prevState.buddies)
        };
      });
    }
  };

  /**
   * called when we render the buddy panel into the gui
   */
  componentDidMount() {
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
    let callCount = 0;

    MemberClient.getOrgOwnerDetails(this, (arg) => {
      callCount++;
      this.isOrgOwner = arg.data.isOrgOwner;
      this.orgType = arg.data.orgType;
      this.handleDataLoadFinished(callCount, arg);
    });
    FervieClient.getBuddyMe(this, (arg) => {
      callCount++;
      this.buddyMe = arg.data;
      this.handleDataLoadFinished(callCount, arg);
    });
    FervieClient.getPendingBuddyList(this, (arg) => {
      callCount++;
      this.pendingBuddies = arg.data;
      this.handleDataLoadFinished(callCount, arg);
    });
    FervieClient.getBuddyList(this, (arg) => {
      callCount++;
      this.buddies = this.sortBuddies(arg.data);
      this.handleDataLoadFinished(callCount, arg);
    });
  }

  sortBuddies(buddyList) {
    return buddyList.sort((a, b) => {
        let aIsOnline = UtilRenderer.isMemberOnline(a);
        let bIsOnline = UtilRenderer.isMemberOnline(b);

        if (aIsOnline && !bIsOnline) {
          return -1;
        } else if (bIsOnline && !aIsOnline) {
          return 1;
        } else if (aIsOnline && bIsOnline) {
          if (a.fervieName < b.fervieName) {
            return -1;
          } else if (a.fervieName > b.fervieName) {
            return 1;
          }
        }
        return 0;
      });
  }

  handleDataLoadFinished(callCount, arg) {
    if (arg.error) {
      console.error("Error during buddy data load: "+arg.error);
    }

    if (callCount !== 4) return;

    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.BUDDIES,
      buddyMe: this.buddyMe,
      buddies: this.buddies,
      pendingBuddies: this.pendingBuddies,
      isOrgOwner: this.isOrgOwner,
      orgType: this.orgType
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

    let me = this.state.buddyMe;
    if (!me) return "";

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
          id={me.id}
          meUsername={me.username}
          isMe={true}
        />
        {this.state.buddies.map(
          (member) =>
            me.id !== member.id &&
            (showOffline || UtilRenderer.isMemberOnline(member)) && (
              <BuddiesPanelListItem
                key={member.sparkId}
                id={member.sparkId}
                meUsername={me.username}
                model={member}
                isMe={false}
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
  sendInviteRequest(email, callback) {
    console.log("Sending request!");
    AccountClient.inviteToBuddyList(email, this, (arg) => {
      callback(arg);
    });
  }

  handleGlobalHudInputLock = () => {
    this.globalHudInputLockNotifier.dispatch({lockInput: true});
  }

  handleGlobalHudInputUnlock = () => {
    this.globalHudInputLockNotifier.dispatch({lockInput: false});
  }


  getInviteBuddyButton() {
    if (this.state.isOrgOwner || this.state.orgType === "COMMUNITY") {
      return <InviteMemberPopup
        handleGlobalHudInputLock={this.handleGlobalHudInputLock}
        handleGlobalHudInputUnlock={this.handleGlobalHudInputUnlock}
        sendInviteRequest={this.sendInviteRequest}
      />
    } else {
      return "";
    }
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
            {this.getInviteBuddyButton()}

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
