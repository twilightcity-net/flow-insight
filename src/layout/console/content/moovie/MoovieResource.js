import React, {Component} from "react";
import GameSketch from "../play/components/GameSketch";
import EnvironmentMap from "../play/components/environment/EnvironmentMap";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../UtilRenderer";
import {BaseClient} from "../../../../clients/BaseClient";
import {FervieClient} from "../../../../clients/FervieClient";

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
      me: null,
      visible: false,
    };

  }

  componentDidMount() {
    FervieClient.getBuddyMe(this, (arg) => {
      if (!arg.error) {
        console.log("XX BUDDY ME!!");
        console.log(arg.data);

        this.setState({
          me: arg.data
        });
      } else {
        console.error("Unable to load buddy me: "+arg.error);
      }
    });

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
    let initialEnvironment = EnvironmentMap.THEATER_ENTRY;
    let initialMoovieId = null;
    if (this.state.visible && this.state.me) {
      if (this.state.me.moovieId) {
        initialEnvironment = EnvironmentMap.THEATER_ROOM;
        initialMoovieId = this.state.me.moovieId;
        console.log("XXXXX initialMoovieId = "+initialMoovieId);
      }

      content = (
        <GameSketch
          me={this.state.me}
          initialEnvironment={initialEnvironment}
          initialMoovieId={initialMoovieId}
          onFinishedLoading={this.onFinishedLoading}
        />
      );
    }

    return <div id="playGameWrapper">{content}</div>;
  }
}
