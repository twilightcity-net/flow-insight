import React, { Component } from "react";
import { Feed } from "semantic-ui-react";
import FervieProfile from "./FervieProfile";

export default class ChatFeedEvent extends Component {
  /**
   * builds our chat feed event to display basic chat messages
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ChatFeedEvent]";

  }

  /**
   * gets our extra text element from our array of texts
   * @returns {*}
   */
  getFeedExtraTextsContent() {
    return this.props.texts.map((message, i) => {
      return (
        <Feed.Extra
          key={i}
          text
          content={this.props.texts[i]}
        />
      );
    });
  }

  /**
   * renders the active circuit feed event into the feed panel loop
   * @returns {*}
   */
  render() {
    return (
      <Feed.Event>
        <Feed.Label className="feedLabel">
          <FervieProfile
            fervieColor={this.props.fervieColor}
            fervieAccessory={this.props.fervieAccessory}
            fervieTertiaryColor={this.props.fervieTertiaryColor}
          />
        </Feed.Label>
        <Feed.Content>
          <Feed.Summary>
            <a href="#">@{this.props.name}</a>
            <Feed.Date>{this.props.time}</Feed.Date>
          </Feed.Summary>
          {this.getFeedExtraTextsContent()}
        </Feed.Content>
      </Feed.Event>
    );
  }

}
