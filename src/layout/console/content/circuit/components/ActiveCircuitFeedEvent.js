import React, { Component } from "react";
import { Feed } from "semantic-ui-react";
import FervieProfile from "../../../../shared/FervieProfile";

export default class ActiveCircuitFeedEvent extends Component {
  /**
   * builds our feed event component which is used to display basic chat messages in the feed event
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitFeedEvent]";

    if (props.setLastFeedEvent) {
      props.setLastFeedEvent(this);
    }
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
    if (this.props.isStatusEvent) {
      return (
        <Feed.Event className="statusUpdate">
          {this.getFeedExtraTextsContent()}
        </Feed.Event>
      );
    } else {
      return (
        <Feed.Event>
          <Feed.Label className="feedLabel">
            <FervieProfile circuitMember={this.props.circuitMember}/>
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

}
