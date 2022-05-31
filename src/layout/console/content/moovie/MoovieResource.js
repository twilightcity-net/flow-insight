import React, {Component} from "react";
import {MemberClient} from "../../../../clients/MemberClient";
import GameSketch from "../play/components/GameSketch";
import EnvironmentMap from "../play/components/environment/EnvironmentMap";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../UtilRenderer";
import {BaseClient} from "../../../../clients/BaseClient";

/**
 * this component is the launch screen for the docked moovie app
 * @copyright Twilight City, Inc. 2022©
 */
export default class MoovieResource extends Component {
  /**
   * builds the moovie layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[MoovieResource]";
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
      data = arg.data,
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
          initialEnvironment={EnvironmentMap.THEATER_ENTRY}
          onFinishedLoading={this.onFinishedLoading}
        />
      );
    }

    return <div id="playGameWrapper">{content}</div>;
  }
}
