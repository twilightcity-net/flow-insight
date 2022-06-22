import React, { Component } from "react";
import { MemberClient } from "../../../../clients/MemberClient";
import GameSketch from "./components/GameSketch";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../UtilRenderer";
import {BaseClient} from "../../../../clients/BaseClient";

/**
 * this component is the tab panel wrapper for the play game content
 * @copyright Twilight City, Inc. 2022©®™√
 */
export default class PlayResource extends Component {
  /**
   * builds the play layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[PlayResource]";
    this.state = {
      me: MemberClient.me,
      visible: false,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        visible: true,
      });
    }, 333);

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );
  }

  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
  }


  onTalkRoomMessage = (event, arg) => {
    let mType = arg.messageType,
      memberId = UtilRenderer.getMemberIdFromMetaProps(arg.metaProps);

    if (mType === BaseClient.MessageTypes.TEAM_MEMBER
      && this.state.me && memberId === this.state.me.id) {
      this.updateMe(arg.data);
    }
  }

  updateMe(me) {
    this.setState({
      me: me
    });
  }

  onFinishedLoading = () => {
    console.log("onFinishedLoading");
    setTimeout(() => {
      document.getElementById(
        "playGameWrapper"
      ).style.opacity = 1;
    }, 333);
  };

  /**
   * renders the game sketch
   * @returns {*} - the rendered components JSX
   */
  render() {
    let content = "";
    if (this.state.visible) {
      content = (
        <GameSketch
          me={this.state.me}
          onFinishedLoading={this.onFinishedLoading}
        />
      );
    }

    return <div id="playGameWrapper">{content}</div>;
  }
}
