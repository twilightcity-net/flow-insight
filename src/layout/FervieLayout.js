import React, {Component} from "react";
import ChatInput from "./shared/ChatInput";
import {TalkToClient} from "../clients/TalkToClient";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import ChatFeed from "./shared/ChatFeed";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import FervieButton from "./dm/FervieButton";
import MessageBanner from "./dm/MessageBanner";
import moment from "moment";
import {NotificationClient} from "../clients/NotificationClient";
import {FervieClient} from "../clients/FervieClient";
import {MoovieClient} from "../clients/MoovieClient";
import FervieProfile from "./shared/FervieProfile";
import FerviePeekAnimation from "./fervie/FerviePeekAnimation";

/**
 * this component is the layout for the always-on-top fervie button
 */
export default class FervieLayout extends Component {

  /**
   * Initialize the component
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[FervieLayout]";
    this.state = {
      me: MemberClient.me
    }
  }

  /**
   * Called when the fervie button is first loaded
   */
  componentDidMount = () => {
    this.meUpdateListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_ME_UPDATE,
        this,
        this.onMeRefresh
      );

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );
  };

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

  componentWillUnmount() {
    this.meUpdateListener.clear();
    this.talkRoomMessageListener.clear();
  }

  onMeRefresh = () => {
    console.log("on me refresh?");
    this.setState({
      me: MemberClient.me
    });
  }

  /**
   * When we click on the fervie app icon
   */
  onClickFervie = () => {
    //this.props.onClickAppIcon();
  }

  /**
   * When we exit with the fervie app icon
   */
  onFervieExit = () => {
    //this.props.onAppExit();
  }

  /**
   * renders the chat console layout
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div id="component" className="fervieLayout" >
        <FerviePeekAnimation position={FerviePeekAnimation.Position.PEEK} me={MemberClient.me}/>
      </div>
    );
  }

}
