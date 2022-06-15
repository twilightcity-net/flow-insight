import React, {Component} from "react";
import {Feed, Icon, Label, Popup} from "semantic-ui-react";
import FervieProfile from "../shared/FervieProfile";
import MontyProfile from "./MontyProfile";
import {MemberClient} from "../../clients/MemberClient";

export default class ErrorFeedEvent extends Component {
  /**
   * builds our feed event for an error message
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ErrorFeedEvent]";
  }


  getErrorTexts() {
    return (
      <div>
        {this.props.texts.map((text, i) => {
          const textMsg = text.message;
          return (
            <Feed.Meta key={i}
                        text
                        content={textMsg}
                        className="errorText"/>
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
      <Feed.Event id={this.props.id} className={"feedErrorEvent"}>
        <Feed.Content>
          {this.getErrorTexts()}
        </Feed.Content>
      </Feed.Event>
    );
  }


}
