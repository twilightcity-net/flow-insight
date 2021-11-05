import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import {
  Divider,
  Feed,
  Segment,
  Transition,
  Menu
} from "semantic-ui-react";
import UtilRenderer from "../../../../../UtilRenderer";
import { MemberClient } from "../../../../../clients/MemberClient";
import ActiveRetroFeedEvent from "./ActiveRetroFeedEvent";

/**
 * this is the gui component that displays the past chat feed from our troubleshooting session
 * in the context of a retro
 */
export default class PastTroubleshootFeed extends Component {
  /**
   * this is our active circuit feed's elemental id. This is so we can look
   * up the active circuit feed by getElementById in our DOM.
   * @type {string}
   */
  static activeCircuitFeedElIdString =
    "past-troubleshoot-feed";

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
    "pastContentFeedPanel";

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
    this.name = "[PastTroubleshootFeed]";
    this.me = MemberClient.me;
    this.lastFeedEvent = null;
    this.memberRequests = 0;
    this.loadCount = 0;

    this.pastChatMembersNotActive = [];
  }


  /**
   * event handle for the vertical panel resize. Adjust the feed panel height
   * when we are resizing so things look nice
   * @param size
   */
  onSecondaryPaneSizeChange = size => {
    document.getElementById(
      PastTroubleshootFeed.circuitContentFeedPanelID
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
          <ActiveRetroFeedEvent
            key={i}
            circuitMember={this.getCircuitMemberForUsername(
              message.name
            )}
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
          <ActiveRetroFeedEvent
            key={i}
            circuitMember={this.getCircuitMemberForUsername(
              message.name
            )}
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
  setLastFeedEventComponent = component => {
    this.lastFeedEvent = component;
  };


  /**
   * renders our active feed component into the current resource view
   * @returns {*}
   */
  getActiveCircuitFeedContent(isChatActive) {
    let circuit = this.props.model,
      openTimeStr = "NOW",
      height = "95%";

    if (circuit) {
      openTimeStr = UtilRenderer.getOpenTimeString(
        circuit.openTime
      );
    }

    return (
      <Segment
        inverted
        id={PastTroubleshootFeed.circuitContentFeedPanelID}
        style={{
          height: height,
          padding: "0px"
        }}
      >
        <Feed
          className="chat-feed"
          id={PastTroubleshootFeed.activeCircuitFeedElIdString}
          style={{
            height: height
          }}
        >
          {this.getDividerContent(openTimeStr)}
          {this.getFeedEventsFromMessagesArrayContent()}
          <br/>
        </Feed>
      </Segment>
    );
  }


  /**
   * adjusts our feed height, and styles. Checks to see if we are paused. if
   * we are paused then we need ot make the active circuit feed at the top
   * the full height, and fade out the chat. otherwise render everything.
   */
  adjustFeedHeight() {
    let el = document.getElementById(
      PastTroubleshootFeed.circuitContentFeedPanelID
      ),
      parentEl = el.parentElement,
      rootEl = parentEl.parentElement,
      children = rootEl.children,
      child = null;

      el.style.height = "100%";
      parentEl.style.height = "100%";
      for (let i = 1; i < children.length; i++) {
        child = children[i];
        child.style.display = "none";
    }
  }

  /**
   * renders our feed chat component in our active circuit resource view.
   * @returns {JSX.Element}
   */
  getActiveCircuitFeedChatContent() {

    let content = this.getActiveCircuitFeedContent(false);

    return content;
  }

  /**
   * our click handler for our minimize button
   */
  handleClick = () => {
    this.props.hideSlidePanel();
  };


  /**
   * renders the active circuit feed into the console view
   * @returns {*}
   */
  render() {
    return (
      <div
        id="component"
        className="retroSlidePanel"
      >
        <Segment inverted>
          <Menu icon inverted fluid secondary>
            <Menu.Item header className="troubleHeader">Troubleshooting Session</Menu.Item>
            <Menu.Item
              link
              position="right"
              icon="window minimize"
              onClick={this.handleClick}
            />
          </Menu>
            <div id="component" className="pastSessionFeed">
              {this.getActiveCircuitFeedChatContent()}
            </div>
        </Segment>
      </div>


    );
  }
}
