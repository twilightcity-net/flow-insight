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
    this.imageEmojiSrc =
      "./assets/images/fervie_profile.png";
    if (props.setLastFeedEvent) {
      props.setLastFeedEvent(this);
    }
    this.state = {
      texts: props.texts,
      time: props.time
    };
  }

  /**
   * gets our extra text element from our array of texts
   * @returns {*}
   */
  getFeedExtraTextsContent() {
    return this.state.texts.map((message, i) => {
      return (
        <Feed.Extra
          key={i}
          text
          content={this.state.texts[i]}
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
        <Feed.Label image={this.imageEmojiSrc} />
        <Feed.Content>
          <Feed.Summary>
            <a>@{this.props.name}</a>
            <Feed.Date>{this.state.time}</Feed.Date>
          </Feed.Summary>
          {this.getFeedExtraTextsContent()}
        </Feed.Content>
      </Feed.Event>
    );
  }
}
