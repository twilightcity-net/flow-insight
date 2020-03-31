import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Divider, Feed, Segment } from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";
import { TeamClient } from "../../../../../clients/TeamClient";
import ActiveCircuitFeedEvent from "./ActiveCircuitFeedEvent";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import moment from "moment";

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

  /**
   * when we load this component we should query for locally stored talk messages. If they dont exist
   * then the client will make a grid time request fetching these documents for the local database.
   */
  componentDidMount() {
    let circuitName = this.props.resource.uriArr[2];
    TalkToClient.getAllTalkMessagesFromRoom(circuitName + "-wtf", this, arg => {
      this.messages = arg.data;
      this.updateChatMessages();
    });
  }

  /**
   * called when we update our active circuit feed. works similar to its parent component.
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.props.resource.uri === nextProps.resource.uri) {
      return false;
    }

    let circuitName = nextProps.resource.uriArr[2];
    TalkToClient.getAllTalkMessagesFromRoom(circuitName + "-wtf", this, arg => {
      this.messages = arg.data;
      this.updateChatMessages();
    });

    return true;
  }

  /**
   * updates our Chat Messages that our in our messages array. This is generally setup initially
   * by our mount or update component functions
   */
  updateChatMessages = () => {
    let metaProps = null,
      userName = null,
      time = null,
      json = null,
      text = [],
      event = null;

    this.feedEvents = [];
    this.messages.map(value => {
      metaProps = value.metaProps;
      userName = !!metaProps && metaProps["from.member.userName"];
      time = UtilRenderer.getOpenTimeStringFromOpenTimeArray(value.messageTime);
      json = JSON.parse(value.jsonBody);
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
    });

    this.forceUpdate();
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
    TalkToClient.publishChatToRoom(roomName + "-wtf", text, this, arg => {
      console.log(arg);
    });
    this.forceUpdate(() => {
      if (callback) {
        callback();
      }
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
      openTimeStr = "";

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
            <Feed className="chat-feed">
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
