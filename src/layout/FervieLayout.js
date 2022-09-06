import React, {Component} from "react";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import FerviePeekAnimation from "./fervie/FerviePeekAnimation";
import {Button, Popup} from "semantic-ui-react";
import {CodeClient} from "../clients/CodeClient";

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
      isSpeechBubbleReady: false,
      isRequestTypeChosen: false,
      requestedAreaType: null,
      requestedArea: null,
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

    this.fervieShowHideNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_FERVIE_SHOW_HIDE,
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
    this.setState({
      me: me
    });
  }

  componentWillUnmount() {
    this.meUpdateListener.clear();
    this.talkRoomMessageListener.clear();
    this.this.fervieShowHideNotifier.clear();
  }

  onMeRefresh = () => {
    this.setState({
      me: MemberClient.me
    });
  }

  onFervieHide = () => {
    console.log("onFervieHide");
    this.setState({
      isSpeechBubbleReady: false
    });
  }

  onFervieShow = () => {
    console.log("onFervieShow");
    CodeClient.getLastCodeLocation(this, (arg) => {
      if (arg.error) {
        console.error(arg.error);
        this.setState({
          error: "Please wait a few moments for me to initialize...",
          isSpeechBubbleReady: true,
          isRequestTypeChosen: false
        });
      } else {
        console.log(arg.data);
        setTimeout(() => {
          this.setState({
            isSpeechBubbleReady: true,
            isRequestTypeChosen: false,
            error: null,
            location: this.getFileNameFromPath(arg.data.location),
            locationPath: arg.data.location,
            box: this.capitalizeFirstLetter(arg.data.box),
            boxPath: arg.data.box
          });
        }, 1000);
      }
    });
  }

  capitalizeFirstLetter(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getFileNameFromPath(filePath) {
    return filePath.replace(/^.*[\\\/]/, '');
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

  onClickAreaOfCode = (areaType, area) => {
    console.log("button pressed for "+area);

    setTimeout(() => {
      this.fervieShowHideNotifier.dispatch({});
    }, 700);

    this.setState({
      requestedAreaType: areaType,
      requestedArea: area,
      isRequestTypeChosen: true
    });
  }


  getConfirmationBubbleContent() {
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
        <div className="happyBig">
          Let's do it!
        </div>
      </Popup.Content>
    </Popup>);
  }

  getPairingBubbleContent() {
    let popupContent = "";

    if (this.state.error) {
      popupContent =
        (
          <Popup.Content className="fervieTalkContent">
            <div>
              {this.state.error}
            </div>
          </Popup.Content>
        );
    } else {
      popupContent = (
        <Popup.Content className="fervieTalkContent">
          <div>
            Would you like me to find you a pair?
          </div>
          <div>
            <Button
              className="bubbleButton"
              size="medium"
              color="grey"
              onClick={() => {
                this.onClickAreaOfCode("box", this.state.boxPath);
              }}
            >
              <Button.Content>Area: {this.state.box}</Button.Content>
            </Button>
          </div>
          <div>
            <Button
              className="bubbleButton"
              size="medium"
              color="grey"
              onClick={() => {
                this.onClickAreaOfCode("file", this.state.locationPath);
              }}
            >
              <Button.Content>{this.state.location}</Button.Content>
            </Button>
          </div>
        </Popup.Content>
      );
    }

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
      {popupContent}
    </Popup>);
  }

  /**
   * renders the chat console layout
   * @returns {*} - the JSX to render
   */
  render() {

    let bubbleContent = "";

    if (this.state.isRequestTypeChosen) {
      bubbleContent = this.getConfirmationBubbleContent();
    } else {
      bubbleContent = this.getPairingBubbleContent();
    }

    return (
      <div id="component" className="fervieLayout" >
        {bubbleContent}
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
