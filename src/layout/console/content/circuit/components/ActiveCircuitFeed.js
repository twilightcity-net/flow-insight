import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Divider, Feed, Segment } from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";
import { TeamClient } from "../../../../../clients/TeamClient";
import ActiveCircuitFeedEvent from "./ActiveCircuitFeedEvent";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import { scrollTo } from "../../../../../UtilScroll";

export default class ActiveCircuitFeed extends Component {
  /**
   * the dom el id name of the circuit feed content panel
   * @type {string}
   */
  static circuitContentFeedPanelID = "circuitContentFeedPanel";

  /**
   * builds the active circuit feed component which is used by the circuit resource
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitFeed]";
    this.me = TeamClient.getMe();
    this.lastFeedEvent = null;
    this.feedEvents = [];
    this.messages = [];
    this.status = [];
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    console.log("update");

    this.messages = nextProps.messages;
    this.updateChatMessages();

    return true;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.scrollToFeedBottom();
  }

  /**
   * updates our Chat Messages that our in our messages array. This is generally setup initially
   * by our mount or update component functions
   */
  updateChatMessages = () => {
    console.log("update chat messages");
    let metaProps = null,
      userName = null,
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
      userName = !!metaProps && metaProps["from.member.userName"];
      time = UtilRenderer.getOpenTimeStringFromOpenTimeArray(m.messageTime);
      json = JSON.parse(m.data);
      text = json.message;

      if (this.lastFeedEvent && this.lastFeedEvent.name === userName) {
        event = this.feedEvents.pop();
        event.text.push(text);
      } else {
        event = {
          name: userName,
          time: time,
          text: [text]
        };
      }

      this.lastFeedEvent = event;
      this.feedEvents.push(event);
    }
  };

  /**
   * function used to scroll our feed panel to the bottom when we build the
   * list or get a new talk message event in from the talk client
   * @param callback
   */
  scrollToFeedBottom = callback => {
    let feedElement = document.getElementById("active-circuit-feed"),
      height = feedElement.scrollHeight;

    scrollTo(feedElement, { behavior: "auto", top: height }).then(callback);
  };

  /**
   * processes our enter key for our chat texting
   * @param text
   * @param callback
   */
  handleEnterKey = (text, callback) => {
    this.addChatMessage(this.me.userName, "NOW - Today", text, callback, true);
  };

  /**
   * adds a new message to our messages array and triggers a rerender
   * @param name
   * @param time
   * @param text
   * @param callback
   */
  addChatMessage = (name, time, text, callback) => {
    let roomName = this.props.resource.uriArr[2],
      message = {
        name: name,
        time: time,
        text: [text]
      };

    if (this.lastFeedEvent && this.lastFeedEvent.props.name === name) {
      message = this.feedEvents.pop();
      message.text.push(text);
    }
    this.feedEvents.push(message);
    TalkToClient.publishChatToRoom(roomName + "-wtf", text);
    this.forceUpdate(() => {
      this.scrollToFeedBottom(callback);
    });
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
      DimensionController.getActiveCircuitFeedContentHeight(size) + "px";
  };

  /**
   * renders our divider content which goes between messages. for keyframe markers
   * @param timeStr
   * @returns {*}
   */
  getDividerContent(timeStr) {
    return <Divider inverted horizontal content={timeStr} />;
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
          onSecondaryPaneSizeChange={this.onSecondaryPaneSizeChange}
        >
          <Segment
            inverted
            id={ActiveCircuitFeed.circuitContentFeedPanelID}
            style={{
              height: DimensionController.getActiveCircuitFeedContentHeight()
            }}
          >
            <Feed className="chat-feed" id="active-circuit-feed">
              {this.getDividerContent(openTimeStr)}
              {this.getFeedEventsFromMessagesArrayContent()}
            </Feed>
          </Segment>
          <div id="wrapper" className="activeCircuitChat">
            <ActiveCircuitChat onEnterKey={this.handleEnterKey} />
          </div>
        </SplitterLayout>
      </div>
    );
  }
}
