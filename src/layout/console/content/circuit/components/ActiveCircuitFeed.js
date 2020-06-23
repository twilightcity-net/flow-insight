import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Divider, Feed, Segment } from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";
import { MemberClient } from "../../../../../clients/MemberClient";
import ActiveCircuitFeedEvent from "./ActiveCircuitFeedEvent";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import { scrollTo } from "../../../../../UtilScroll";
import { RendererEventFactory } from "../../../../../events/RendererEventFactory";
import { BaseClient } from "../../../../../clients/BaseClient";

export default class ActiveCircuitFeed extends Component {
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
    this.feedEvents = [];
    this.messages = [];
    this.status = [];
    this.talkRoomMessageListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_MESSAGE_ROOM,
      this,
      this.onTalkRoomMessage
    );
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
    this.messages = nextProps.messages;
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
    let time = UtilRenderer.getOpenTimeStringFromOpenTimeArray(
        message.messageTime
      ),
      metaProps = message.metaProps,
      username = !!metaProps && metaProps["from.username"],
      data = message.data,
      text = data.message,
      event = {
        name: username,
        time: time,
        text: [text]
      };

    this.lastFeedEvent = event;
    this.feedEvents.push(event);

    this.messages.push(message);

    this.forceUpdate(() => {
      this.scrollToFeedBottom();
    });
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
      text = [],
      event = null,
      messages = this.messages,
      messagesLength = this.messages.length;

    this.feedEvents = [];

    for (let i = 0, m = null; i < messagesLength; i++) {
      m = messages[i];
      metaProps = m.metaProps;
      username = !!metaProps && metaProps["from.username"];
      time = UtilRenderer.getOpenTimeStringFromOpenTimeArray(
        m.messageTime
      );
      json = m.data;
      text = json.message;

      if (
        this.lastFeedEvent &&
        this.lastFeedEvent.name === username
      ) {
        event = this.feedEvents.pop();
        event.text.push(text);
      } else {
        event = {
          name: username,
          time: time,
          text: [text]
        };
      }

      this.lastFeedEvent = event;
      this.feedEvents.push(event);
    }
  };

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
          callback();
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
        "active-circuit-feed"
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
      this.lastFeedEvent = (
        <ActiveCircuitFeedEvent
          key={i}
          name={message.name}
          time={message.time}
          texts={message.text}
        />
      );
      return this.lastFeedEvent;
    });
  }

  /**
   * renders the active circuit feed into the console view
   * @returns {*}
   */
  render() {
    let circuit = this.props.model,
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
          <div id="wrapper" className="activeCircuitChat">
            <ActiveCircuitChat
              onEnterKey={this.handleEnterKey}
            />
          </div>
        </SplitterLayout>
      </div>
    );
  }
}
