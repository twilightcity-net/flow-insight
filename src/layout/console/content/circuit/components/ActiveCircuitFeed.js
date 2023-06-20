import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import {
  Divider,
  Feed,
  Segment,
  Transition,
} from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";
import { MemberClient } from "../../../../../clients/MemberClient";
import ActiveCircuitFeedEvent from "./ActiveCircuitFeedEvent";
import { TalkToClient } from "../../../../../clients/TalkToClient";

/**
 * this is the gui component that displays the actual on going real-time
 * chat feed of the active circuit that the people are in.
 */
export default class ActiveCircuitFeed extends Component {
  /**
   * this is our active circuit feed's elemental id. This is so we can look
   * up the active circuit feed by getElementById in our DOM.
   * @type {string}
   */
  static activeCircuitFeedElIdString =
    "active-circuit-feed";

  /**
   * the string that is appended to the end of a circuit name which is the
   * convention used by the talk network to reference a specific wtf room
   * which is associated with this active circuit
   * @type {string}
   */
  static activeCircuitRoomSuffix = "-wtf";

  /**
   * the dom el id name of the circuit feed content panel
   * @type {string}
   */
  static circuitContentFeedPanelID =
    "circuitContentFeedPanel";

  /**
   * builds the active circuit feed component which is used by the circuit resource
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitFeed]";
    this.me = MemberClient.me;
    this.lastFeedEvent = null;
    this.memberRequests = 0;
    this.loadCount = 0;
    this.hasMessageAdded = false;

    this.pastChatMembersNotActive = [];

    this.props.set(this);
  }

  /**
   * scroll to the bottom of the feed whenever we get some changes to the
   * messages array that drives the feed.
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    //make sure we've got all our circuit members, and if not, send a retrieval request for them

    if (this.hasMessageAdded && prevProps.feedEvents.length !== this.props.feedEvents.length) {
      this.scrollToFeedBottom();
    }
  }

  /**
   * adds a new message to our messages array and triggers a rerender
   * @param text
   * @param callback
   */
  addChatMessage = (text, callback) => {
    this.hasMessageAdded = true;
    let roomName = this.props.resource.uriArr[1];
    TalkToClient.publishChatToRoom(
      roomName + ActiveCircuitFeed.activeCircuitRoomSuffix,
      text,
      this,
      (arg) => {
        if (arg.error) {
          console.error(arg.error);
          this.props.reportFeedError(
            "Unable to publish message.  Please try again later."
          );
        }
        if (callback) {
          callback(arg);
        }
      }
    );
  };

  /**
   * function used to scroll our feed panel to the bottom when we build the
   * list or get a new talk message event in from the talk client
   */
  scrollToFeedBottom = () => {
    let feedElement = document.getElementById(
      ActiveCircuitFeed.activeCircuitFeedElIdString
    );
    feedElement.scrollTop = feedElement.scrollHeight;
  };

  /**
   * processes our enter key for our chat texting
   * @param text
   * @param callback
   */
  handleEnterKey = (text, callback) => {
    this.addChatMessage(text, callback, true);
  };

  /**
   * event handle for the vertical panel resize. Adjust the feed panel height
   * when we are resizing so things look nice
   * @param size
   */
  onSecondaryPaneSizeChange = (size) => {
    document.getElementById(
      ActiveCircuitFeed.circuitContentFeedPanelID
    ).style.height =
      DimensionController.getActiveCircuitFeedContentHeight(
        size
      ) + "px";
  };

  /**
   * renders our divider content which goes between messages. for keyframe markers
   * @param timeStr
   * @returns {*}
   */
  getDividerContent(timeStr) {
    return (
      <Divider inverted horizontal content={timeStr} />
    );
  }

  /**
   * Get the circuit member that matches the username
   * @param username
   * @returns {*}
   */
  getCircuitMemberForUsername(username) {
    for (
      let i = 0;
      i < this.props.circuitMembers.length;
      i++
    ) {
      if (
        this.props.circuitMembers[i].username === username
      ) {
        return this.props.circuitMembers[i];
      }
    }

    for (
      let i = 0;
      i < this.props.missingMembers.length;
      i++
    ) {
      if (
        this.props.missingMembers[i].username === username
      ) {
        return this.props.missingMembers[i];
      }
    }

    return null;
  }

  /**
   * renders our feed messages from our messages array.
   * @returns {*}
   */
  getFeedEventsFromMessagesArrayContent() {
    return this.props.feedEvents.map((message, i) => {
      if (i === this.props.feedEvents.length - 1) {
        return (
          <ActiveCircuitFeedEvent
            key={i}
            circuitMember={this.getCircuitMemberForUsername(
              message.name
            )}
            isStatusEvent={message.isStatusEvent}
            name={message.name}
            time={message.time}
            texts={message.text}
            setLastFeedEvent={
              this.setLastFeedEventComponent
            }
          />
        );
      } else {
        return (
          <ActiveCircuitFeedEvent
            key={i}
            circuitMember={this.getCircuitMemberForUsername(
              message.name
            )}
            isStatusEvent={message.isStatusEvent}
            name={message.name}
            time={message.time}
            texts={message.text}
          />
        );
      }
    });
  }

  /**
   * callback function which is used by the active circuit feed event to
   * update the last feed event. This is suppose to concat messages which
   * have the same username.
   * @param component
   */
  setLastFeedEventComponent = (component) => {
    this.lastFeedEvent = component;
  };

  /**
   * renders our active chat component which is used to input text and
   * hypermedia to push over the circuit.
   * @returns {*}
   */
  getActiveCircuitChatContent() {
    let isPaused = UtilRenderer.isCircuitStatePaused(
      this.props.circuitState
    );
    let isParticipant = UtilRenderer.isCircuitParticipant(
      MemberClient.me,
      this.props.circuitMembers
    );

    return (
      <Transition
        visible={isParticipant && !isPaused}
        animation="fade"
        duration={210}
        onComplete={this.onCircuitChatShown}
      >
        <div id="wrapper" className="activeCircuitChat">
          <ActiveCircuitChat
            onEnterKey={this.handleEnterKey}
          />
        </div>
      </Transition>
    );
  }

  /**
   * renders our active feed component into the current resource view
   * @returns {*}
   */
  getActiveCircuitFeedContent(isChatActive) {
    let circuit = this.props.model,
      openTimeStr = "NOW",
      height = "100%";

    if (circuit) {
      openTimeStr = UtilRenderer.getOpenTimeString(
        circuit.openTime
      );
    }

    if (isChatActive) {
      height =
        DimensionController.getActiveCircuitFeedContentHeight();
    }

    return (
      <Segment
        inverted
        id={ActiveCircuitFeed.circuitContentFeedPanelID}
        style={{
          height: height,
        }}
      >
        <Feed
          className="chat-feed"
          id="active-circuit-feed"
        >
          {this.getDividerContent(openTimeStr)}
          {this.getFeedEventsFromMessagesArrayContent()}
        </Feed>
      </Segment>
    );
  }

  /**
   * animation callback function that is dispatched after the chat component
   * has faded out of view for the user, typically happens when the circuit is
   * paused or resumed.
   */
  onCircuitChatShown = () => {
    this.adjustFeedHeight();
  };

  /**
   * adjusts our feed height, and styles. Checks to see if we are paused. if
   * we are paused then we need ot make the active circuit feed at the top
   * the full height, and fade out the chat. otherwise render everything.
   */
  adjustFeedHeight() {
    let el = document.getElementById(
        ActiveCircuitFeed.circuitContentFeedPanelID
      ),
      parentEl = el.parentElement,
      rootEl = parentEl.parentElement,
      children = rootEl.children,
      child = null;

    if (!UtilRenderer.isCircuitPaused(this.props.model)) {
      for (let i = 1; i < children.length; i++) {
        child = children[i];
        child.style.display = "block";
      }
    } else {
      el.style.height = "100%";
      parentEl.style.height = "100%";
      for (let i = 1; i < children.length; i++) {
        child = children[i];
        child.style.display = "none";
      }
    }
  }

  /**
   * renders our feed chat component in our active circuit resource view.
   * @returns {JSX.Element}
   */
  getActiveCircuitFeedChatContent() {
    let isParticipant = UtilRenderer.isCircuitParticipant(
      MemberClient.me,
      this.props.circuitMembers
    );
    let isPaused = UtilRenderer.isCircuitStatePaused(
      this.props.circuitState
    );

    let content = (
      <SplitterLayout
        customClassName="feed"
        vertical
        primaryMinSize={DimensionController.getActiveCircuitContentFeedMinHeight()}
        secondaryMinSize={DimensionController.getActiveCircuitContentChatMinHeight()}
        secondaryInitialSize={DimensionController.getActiveCircuitContentChatMinHeightDefault()}
        onSecondaryPaneSizeChange={
          this.onSecondaryPaneSizeChange
        }
      >
        {this.getActiveCircuitFeedContent(true)}
        {this.getActiveCircuitChatContent()}
      </SplitterLayout>
    );

    if (!isParticipant || isPaused) {
      content = this.getActiveCircuitFeedContent(false);
    }

    return content;
  }

  /**
   * renders the active circuit feed into the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitFeed">
        {this.getActiveCircuitFeedChatContent()}
      </div>
    );
  }
}
