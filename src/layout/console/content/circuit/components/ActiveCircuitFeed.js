import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import {Divider, Feed, Segment} from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";
import UtilRenderer from "../../../../../UtilRenderer";

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
    this.imageEmojiSrc = "./assets/images/emoji_cool.png";
    this.messages = [{name : "Zoe Love", time: "1 hour ago", description: "Ours is a life of constant reruns. We're always circling back to life."}];
  }

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
   * renders our feed event
   * @returns {*}
   * @param key
   * @param name
   * @param time
   * @param text
   */
  getFeedEventContent(key, name, time, text) {
      return (
        <Feed.Event key={key}>
          <Feed.Label image={this.imageEmojiSrc} />
          <Feed.Content>
            <Feed.Summary>
              <a>{name}</a>
              <Feed.Date>{time}</Feed.Date>
            </Feed.Summary>
            <Feed.Extra text>
              {text}
            </Feed.Extra>
          </Feed.Content>
        </Feed.Event>
      );
  }

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
  getFeedeventsFromMessagesArrayContent() {
    return this.messages.map((message, i) => {
      return this.getFeedEventContent(i, message.name, message.time, message.description);
    });
  }

  /**
   * renders the active circuit feed into the console view
   * @returns {*}
   */
  render() {
    let circuit = this.props.model,
      openTimeStr = "";

    if(circuit) {
      openTimeStr = UtilRenderer.getOpenTimeStringFromOpenTimeArray(circuit.openTime);
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
              {this.getFeedeventsFromMessagesArrayContent()}
            </Feed>
          </Segment>
          <div id="wrapper" className="activeCircuitChat">
            <ActiveCircuitChat />
          </div>
        </SplitterLayout>
      </div>
    );
  }
}
