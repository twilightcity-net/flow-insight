import React, { Component } from "react";
import { Feed } from "semantic-ui-react";
import FervieProfile from "../shared/FervieProfile";
import MontyProfile from "./MontyProfile";

export default class ChatFeedEvent extends Component {
  /**
   * builds our chat feed event to display basic chat messages
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ChatFeedEvent]";

  }

  getFeedTextBubbles(bubbleClass) {
    return (
      <div>
      {this.props.texts.map((text, i) => {
          return (<Feed.Extra key={i}
                          text
                          content={text}
                          className={bubbleClass}/>);
      })}
      </div>);
  }
  /**
   * renders the active circuit feed event into the feed panel loop
   * @returns {*}
   */
  render() {
    let profileImage = "";
    let bubbleClass = "bubbleRight";

    if (this.props.isPuppet) {
      bubbleClass = "bubblePuppet";
      profileImage = (<MontyProfile />);

    } else {
      if (!this.props.isMe) {
        profileImage = (<FervieProfile
          fervieColor={this.props.fervieColor}
          fervieAccessory={this.props.fervieAccessory}
          fervieTertiaryColor={this.props.fervieTertiaryColor}
        />);
        bubbleClass = "bubbleLeft";
      }
    }

    return (
      <Feed.Event>
        <Feed.Label className="feedLabel">
          {profileImage}
        </Feed.Label>
        <Feed.Content>
          {this.getFeedTextBubbles(bubbleClass)}
          <Feed.Meta className={bubbleClass}>
            {this.props.time}
          </Feed.Meta>
        </Feed.Content>
      </Feed.Event>
    );
  }

}
