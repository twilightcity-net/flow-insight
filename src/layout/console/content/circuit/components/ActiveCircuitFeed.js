import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import {
  Divider,
  Feed,
  Segment,
  Transition
} from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";
import { MemberClient } from "../../../../../clients/MemberClient";
import ActiveCircuitFeedEvent from "./ActiveCircuitFeedEvent";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import { scrollTo } from "../../../../../UtilScroll";
import { RendererEventFactory } from "../../../../../events/RendererEventFactory";
import { BaseClient } from "../../../../../clients/BaseClient";

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
   * the dom el id name of the circuit feed content panel
   * @type {string}
   */
  static circuitContentFeedPanelID =
    "circuitContentFeedPanel";

  /**
   * this is the name of the meta property field which the talk message uses
   * to store the value of the user whom made the request typically.
   * @type {string}
   */
  static fromUserNameMetaPropsStr = "from.username";

  /**
   * builds the active circuit feed component which is used by the circuit resource
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitFeed]";
    this.me = MemberClient.me;
    this.lastFeedEvent = null;
    this.feedEvents = [];
    this.messages = [];
    this.status = [];
    this.talkRoomMessageListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_MESSAGE_ROOM,
      this,
      this.onTalkRoomMessage
    );
    this.state = {
      resource: props.resource,
      model: null,
      messages: []
    };
    this.props.set(this);
  }

  /**
   * our event handler for our talk room message. This function is used to
   * make sure we do not double enter a message in which we have already
   * added. meaning we published the message ourselves. Most often these
   * messages will be from other people on the talk networks
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    let hasMessage = UtilRenderer.hasMessageInArray(
      this.messages,
      arg
    );

    switch (arg.messageType) {
      case BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS:
        if (!hasMessage) {
          this.appendChatMessage(arg);
        }
        break;
      default:
        break;
    }
  };

  /**
   * make sure we update our chat messages in our renderer when whenever we
   * get some gui updates for this component
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    this.messages = nextState.messages;
    this.updateChatMessages();
    return true;
  }

  /**
   * when our component updates, lets also scroll down to the bottom of this
   * feed component
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    this.scrollToFeedBottom();
  }

  /**
   * make sure we clear our talk room listener when destroying this component
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
  }

  /**
   * adds a chat message to the end of all of our chat
   * messages, and update the gui. This assumes we have
   * already loaded the circuit resource view.
   * @param message
   */
  appendChatMessage(message) {
    let metaProps = message.metaProps,
      username = this.getUsernameFromMetaProps(metaProps),
      time = UtilRenderer.getChatMessageTimeString(
        message.messageTime
      ),
      json = message.data;

    this.updateFeedEvent(
      username,
      null,
      time,
      json.message
    );

    this.messages.push(message);
    this.forceUpdate(() => {
      this.scrollToFeedBottom();
    });
  }

  /**
   * renders our username from the talk message's metaprop which contains
   * the string of this.
   * @param metaProps
   * @returns {boolean|*}
   */
  getUsernameFromMetaProps(metaProps) {
    return (
      !!metaProps &&
      metaProps[ActiveCircuitFeed.fromUserNameMetaPropsStr]
    );
  }

  /**
   * updates our Chat Messages that our in our messages array. This is generally setup initially
   * by our mount or update component functions
   */
  updateChatMessages = () => {
    let metaProps = null,
      username = null,
      time = null,
      json = null,
      messages = this.messages,
      messagesLength = this.messages.length;

    this.feedEvents = [];

    for (let i = 0, m = null; i < messagesLength; i++) {
      m = messages[i];
      metaProps = m.metaProps;
      username =
        !!metaProps &&
        metaProps[
          ActiveCircuitFeed.fromUserNameMetaPropsStr
        ];
      time = UtilRenderer.getChatMessageTimeString(
        m.messageTime
      );
      json = m.data;

      this.updateFeedEvent(
        username,
        null,
        time,
        json.message
      );
    }
  };

  /**
   * updates our feed events array which is used to generate the list of
   * feed events in the gui which displays all of the chat messages
   * @param username
   * @param feedEvent
   * @param time
   * @param text
   */
  updateFeedEvent(username, feedEvent, time, text) {
    if (
      this.feedEvents.length > 0 &&
      this.feedEvents[this.feedEvents.length - 1] &&
      this.feedEvents[this.feedEvents.length - 1].name ===
        username
    ) {
      feedEvent = this.feedEvents.pop();
      feedEvent.text.push(text);
    } else {
      feedEvent = {
        name: username,
        time: time,
        text: [text]
      };
    }

    this.feedEvents.push(feedEvent);
  }

  /**
   * adds a new message to our messages array and triggers a rerender
   * @param text
   * @param callback
   */
  addChatMessage = (text, callback) => {
    let roomName = this.props.resource.uriArr[2];
    TalkToClient.publishChatToRoom(
      roomName + "-wtf",
      text,
      this,
      arg => {
        if (callback) {
          callback(arg);
        }
      }
    );
  };

  /**
   * function used to scroll our feed panel to the bottom when we build the
   * list or get a new talk message event in from the talk client
   * @param callback
   */
  scrollToFeedBottom = callback => {
    let feedElement = document.getElementById(
        ActiveCircuitFeed.activeCircuitFeedElIdString
      ),
      height = feedElement.scrollHeight;

    scrollTo(feedElement, {
      behavior: "auto",
      top: height
    }).then(callback);
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
  onSecondaryPaneSizeChange = size => {
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
   * renders our feed messages from our messages array.
   * @returns {*}
   */
  getFeedEventsFromMessagesArrayContent() {
    return this.feedEvents.map((message, i) => {
      if (i === this.feedEvents.length - 1) {
        return (
          <ActiveCircuitFeedEvent
            key={i}
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
   * update the last feed event. This is suspose to concat messages which
   * have the same username.
   * @param component
   */
  setLastFeedEventComponent = component => {
    this.lastFeedEvent = component;
  };

  /**
   * renders our active chat component which is used to input text and
   * hypermedia to push over the circuit.
   * @returns {*}
   */
  getActiveCircuitChatContent() {
    return (
      <Transition
        visible={
          !UtilRenderer.isCircuitPaused(this.state.model)
        }
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

    if (!UtilRenderer.isCircuitPaused(this.state.model)) {
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
   * renders the active circuit feed into the console view
   * @returns {*}
   */
  render() {
    let circuit = this.state.model,
      openTimeStr = "NOW";

    if (circuit) {
      openTimeStr = UtilRenderer.getOpenTimeStringFromOpenTimeArray(
        circuit.openTime
      );
    }

    return (
      <div id="component" className="activeCircuitFeed">
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
          <Segment
            inverted
            id={ActiveCircuitFeed.circuitContentFeedPanelID}
            style={{
              height: DimensionController.getActiveCircuitFeedContentHeight()
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
          {this.getActiveCircuitChatContent()}
        </SplitterLayout>
      </div>
    );
  }
}
