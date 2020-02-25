import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Divider, Feed, Segment } from "semantic-ui-react";
import SplitterLayout from "react-splitter-layout";
import ActiveCircuitChat from "./ActiveCircuitChat";

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
   * @param index
   * @returns {*}
   */
  getFeedEvent(index) {
    if (index === 0) {
      return (
        <Feed.Event>
          <Feed.Label image={this.imageEmojiSrc} />
          <Feed.Content>
            <Feed.Summary>
              <a>Zoe Love</a>
              <Feed.Date>1 hour ago</Feed.Date>
            </Feed.Summary>
            <Feed.Extra text>
              Ours is a life of constant reruns. We're always circling back to
              where we'd we started, then starting all over again. Even if we
              don't run extra laps that day, we surely will come back for more
              of the same another day soon.
            </Feed.Extra>
          </Feed.Content>
        </Feed.Event>
      );
    } else {
      return (
        <Feed.Event>
          <Feed.Label image={this.imageEmojiSrc} />
          <Feed.Content>
            <Feed.Summary>
              <a>Arty Starr</a>
              <Feed.Date>1 min ago</Feed.Date>
            </Feed.Summary>
            <Feed.Extra images>
              <img alt="" src={this.imageEmojiSrc} />
              <img alt="" src={this.imageEmojiSrc} />
              <img alt="" src={this.imageEmojiSrc} />
            </Feed.Extra>
          </Feed.Content>
        </Feed.Event>
      );
    }
  }
  /**
   * renders the active circuit feed into the console view
   * @returns {*}
   */
  render() {
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
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(1)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(1)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(1)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
              <Divider inverted horizontal content={"12:34:56 PM"} />
              {this.getFeedEvent(0)}
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
