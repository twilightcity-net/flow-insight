import React, { Component } from "react";
import { Feed } from "semantic-ui-react";

export default class ActiveCircuitFeedEvent extends Component {
  /**
   * builds our feed event component which is used to display basic chat messages in the feed event
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitFeedEvent]";
    this.imageEmojiSrc = "./assets/images/emoji_cool.png";
    this.texts = this.props.texts;
  }

  /**
   * gets our extra text element from our array  of texts
   * @returns {*}
   */
  getFeedExtraTextsContent() {
    return this.texts.map((message, i) => {
      return <Feed.Extra key={i} text content={this.texts[i]} />;
    });
  }

  /**
   * renders the active circuit feed event into the feed panel loop
   * @returns {*}
   */
  render() {
    return (
      <Feed.Event>
        <Feed.Label image={this.imageEmojiSrc} />
        <Feed.Content>
          <Feed.Summary>
            <a>@{this.props.name}</a>
            <Feed.Date>{this.props.time}</Feed.Date>
          </Feed.Summary>
          {this.getFeedExtraTextsContent()}
        </Feed.Content>
      </Feed.Event>
    );
  }
}
