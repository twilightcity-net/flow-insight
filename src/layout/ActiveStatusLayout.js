import React, {Component} from "react";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";

/**
 * this component is the layout for the always-on-top active status bar
 */
export default class ActiveStatusLayout extends Component {

  /**
   * Initialize the component
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveStatusLayout]";
    this.state = {
      me: MemberClient.me
    }
  }

  static FOCUS_TYPE = "focus";
  static TROUBLESHOOT_TYPE = "troubleshoot";
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

    this.showHideStatusEvent =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_STATUS_SHOW_HIDE,
        this
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
    let updatedContent = this.getBubbleContent(me);
    if (updatedContent) {
      console.log("dispatch show");
      this.showHideStatusEvent.dispatch({show: 1});
    } else {
      console.log("dispatch hide");
      this.showHideStatusEvent.dispatch({show: 0});
    }

    this.setState({
      me: me
    });
  }

  componentWillUnmount() {
    this.meUpdateListener.clear();
    this.talkRoomMessageListener.clear();
  }

  onMeRefresh = () => {
    this.updateMe(MemberClient.me);
  }

  getBubbleContent(me) {
    let content = "";
    if (me) {
      if (me.activeCircuit) {
        let description = me.activeCircuit.description;
        if (!description) {
          description = "What's the problem?";
        }
        content = description;

      } else if (me.workingOn) {
        content = me.workingOn;
      }
    }
    if (content.length > 56) {
      content = content.substring(0, 54) + "..";
    }

    return content;
  }

  getBubbleType(me) {
    let type = "none";
    if (me) {
      if (me.activeCircuit) {
        type = ActiveStatusLayout.TROUBLESHOOT_TYPE;
      } else if (me.workingOn) {
        type = ActiveStatusLayout.FOCUS_TYPE;
      }
    }
    return type;
  }

  getBubbleHeaderBasedOnType(bubbleType) {
    let header = "";
    if (bubbleType === ActiveStatusLayout.TROUBLESHOOT_TYPE) {
      header = "Troubleshoot:";
    } else if (bubbleType === ActiveStatusLayout.FOCUS_TYPE) {
      header = "Focus:";
    }
    return header;
  }

  /**
   * renders the status bar layout
   * @returns {*} - the JSX to render
   */
  render() {

    let bubbleContent = this.getBubbleContent(this.state.me);
    let bubbleType = this.getBubbleType(this.state.me);
    let bubbleHeader = this.getBubbleHeaderBasedOnType(bubbleType);

    if (!bubbleContent) {
      return <div></div>;
    }

    return (
      <div id="component" className="activeStatusLayout" >
        <div className={"statusBar "+ bubbleType}>
          <span className={"statusHeader "+bubbleType}>{bubbleHeader}</span>
          <span className="status">
            {bubbleContent}
          </span>
        </div>
      </div>
    );
  }

}
