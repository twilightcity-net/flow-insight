import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Divider, Feed, Segment } from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";
import { TeamClient } from "../../../../../clients/TeamClient";
import ActiveCircuitFeedEvent from "./ActiveCircuitFeedEvent";

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
    this.messages = [];
    this.lastFeedEvent = null;
    this.me = TeamClient.getMe();
  }

  /**
   * processes our enter key for our chat texting
   * @param text
   * @param callback
   */
  handleEnterKey = (text, callback) => {
    this.addChatMessage(this.me.userName, "NOW - Today", text, callback);
  };

  /**
   * adds a new message to our messages array and triggers a rerender
   * @param name
   * @param time
   * @param text
   * @param callback
   */
  addChatMessage = (name, time, text, callback) => {
    let message = {
      name: name,
      time: time,
      text: [text]
    };
    if (this.lastFeedEvent && this.lastFeedEvent.props.name === name) {
      message = this.messages.pop();
      message.text.push(text);
    }
    this.messages.push(message);
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
    return this.messages.map((message, i) => {
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
