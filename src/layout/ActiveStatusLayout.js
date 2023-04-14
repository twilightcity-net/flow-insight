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
    this.setState({
      me: MemberClient.me
    });
  }

  getBubbleContent() {
    let content = "";
    if (this.state.me) {
      if (this.state.me.activeCircuit) {
        let description = this.state.me.activeCircuit.description;
        if (!description) {
          description = "What's the problem?";
        }
        content = description;

      } else if (this.state.me.workingOn) {
        content = this.state.me.workingOn;
      }
    }
    if (content.length > 69) {
      content = content.substring(0, 67) + "..";
    }

    return content;
  }

  getBubbleType() {
    let type = "none";
    if (this.state.me) {
      if (this.state.me.activeCircuit) {
        type = ActiveStatusLayout.TROUBLESHOOT_TYPE;
      } else if (this.state.me.workingOn) {
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

    let bubbleContent = this.getBubbleContent();
    let bubbleType = this.getBubbleType();
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
