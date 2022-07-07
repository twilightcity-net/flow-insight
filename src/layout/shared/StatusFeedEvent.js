import React, {Component} from "react";
import {Feed} from "semantic-ui-react";

export default class StatusFeedEvent extends Component {
  /**
   * builds our feed event for a status message
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[StatusFeedEvent]";
  }


  getStatusTexts() {
    return (
      <div>
        {this.props.texts.map((text, i) => {
          const textMsg = text.message;
          return (
            <Feed.Meta key={i}
                        text
                        content={textMsg}
                        className="statusText"/>
            );
        })}
      </div>);
  }

  /**
   * renders the error message in the chat feed
   * @returns {*}
   */
  render() {
    return (
      <Feed.Event id={this.props.id} className={"feedStatusEvent"}>
        <Feed.Content>
          {this.getStatusTexts()}
        </Feed.Content>
      </Feed.Event>
    );
  }


}
