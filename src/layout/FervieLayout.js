import React, {Component} from "react";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import FerviePeekAnimation from "./fervie/FerviePeekAnimation";
import {Button, Popup} from "semantic-ui-react";
import EmojiPicker from "./shared/EmojiPicker";

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
      me: MemberClient.me,
      isSpeechBubbleReady: false
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

  onFervieHide = () => {
    this.setState({
      isSpeechBubbleReady: false
    });
  }

  onFervieShow = () => {
    setTimeout(() => {
      this.setState({
        isSpeechBubbleReady: true
      });
    }, 1000);
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

  getSpeechBubbleContent() {
    return (<Popup id="fervieTalkBubble" className="fervieTalkBubble"
      position='bottom center'
      inverted
      offset={[0, 50]}
      open={this.state.isSpeechBubbleReady}
      flowing
      trigger={
        (<span className="fervieSpeechTrigger">
       &nbsp;
        </span>)
      }
    >
      <Popup.Content className="fervieTalkContent">
      <div>
        Would you like me to find you a pair?

        </div>
        <div>
        <Button
          className="bubbleButton"
          size="medium"
          color="grey"
        >
          <Button.Content>Area: Electron</Button.Content>
        </Button>
        </div>
        <div>
        <Button
          className="bubbleButton"
          size="medium"
          color="grey"
        >
          <Button.Content>CircuitSidebar.js</Button.Content>
        </Button>
        </div>
      </Popup.Content>
    </Popup>);
  }

  /**
   * renders the chat console layout
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div id="component" className="fervieLayout" >
        {this.getSpeechBubbleContent()}
        <FerviePeekAnimation
          position={FerviePeekAnimation.Position.PEEK}
          me={MemberClient.me}
          onFervieHide={this.onFervieHide}
          onFervieShow={this.onFervieShow}
        />
      </div>
    );
  }

}
