import React, {Component} from "react";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import FerviePeekAnimation from "./fervie/FerviePeekAnimation";
import {Button, Icon, Popup} from "semantic-ui-react";
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
      isSpeechBubbleReady: false, //make sure the plugin code integration is initialized
      isSelectionClicked: false, //we've clicked the button
      requestType: null, //the source type of the fervie request (hotkey, help)
      requestInfo: {}, //the information relevant to the request

      requestedAreaType: null, //code area selection type, this will go away
      requestedArea: null, //code area selected, this will go away
    }
  }

  static HELP_REQUEST = "help";
  static HOTKEY_REQUEST = "hotkey";

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
        this,
        this.onFervieShowHideEvent
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

  onFervieShowHideEvent = (event, arg) => {
    console.log("onFervieShowHideEvent = "+JSON.stringify(arg));
    if (arg.request === FervieLayout.HELP_REQUEST) {
      console.log("help type!");
      this.setState({
        requestType: "help",
        requestInfo: {
          box: arg.message.boxName,
          module: arg.message.moduleName,
          circuitLink: "/wtf/"+arg.message.learningCircuitDto.circuitName
        },
        isSelectionClicked: false
      });
    } else if (arg.request === FervieLayout.HOTKEY_REQUEST) {
      this.setState({
        requestType: "hotkey",
        requestInfo: {},
        isSelectionClicked: false
      });
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
    setTimeout(() => {
      this.setState({
        isSelectionClicked: false,
      });
    }, 1000);
  }

  onFervieShow = () => {
    console.log("onFervieShow");
    if (this.state.requestType === FervieLayout.HOTKEY_REQUEST) {
      this.initializeCodeState();
    } else if (this.state.requestType === FervieLayout.HELP_REQUEST) {
      //no init required, should be set already
      this.initializeHelpState();
    }
  }


  initializeHelpState() {
    setTimeout( () => {
      this.setState({
        error: null,
        isSpeechBubbleReady: true,
        isSelectionClicked: false
      });
    }, 1000);
  }

  initializeCodeState() {
    CodeClient.getLastCodeLocation(this, (arg) => {
      if (arg.error) {
        console.error(arg.error);
        this.setState({
          error: "Please wait a few moments for me to initialize...",
          isSpeechBubbleReady: true,
          isSelectionClicked: false
        });
      } else {
        console.log(arg.data);
        setTimeout(() => {
          this.setState({
            isSpeechBubbleReady: true,
            isSelectionClicked: false,
            error: null,
            requestInfo: {
              box: this.capitalizeFirstLetter(arg.data.box),
              boxPath: arg.data.box
            }
          });
        }, 1000);
      }
    });
  }

  capitalizeFirstLetter(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * When we click on the fervie app icon
   */
  onClickFervie = () => {
    //this.props.onClickAppIcon();
  }


  onClickAreaOfCode = (areaType, area) => {
    console.log("button pressed for "+area);

    setTimeout(() => {
      this.fervieShowHideNotifier.dispatch({});
    }, 700);

    this.setState({
      isSelectionClicked: true
    });
  }

  onClickCircuitLink = (circuitLink) => {
    console.log("button pressed for "+circuitLink);

    setTimeout(() => {
      this.fervieShowHideNotifier.dispatch({});
    }, 700);

    //TODO make this navigate to circuit, need to send an event here that can echo back to our console

    this.setState({
      isSelectionClicked: true
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


  getHelpLightBubbleContent() {
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
            Could you shed some light on this?
          </div>
          <div>
            <Button
              className="bubbleButton"
              size="medium"
              color="grey"
              onClick={() => {
                this.onClickCircuitLink(this.state.requestInfo.circuitLink);
              }}
            >
              <Button.Content>
                <Icon name="lightbulb outline"/>
                {this.state.requestInfo.module}.{this.state.requestInfo.box}</Button.Content>
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
                this.onClickAreaOfCode("box", this.state.requestInfo.boxPath);
              }}
            >
              <Button.Content>Area: {this.state.requestInfo.box}</Button.Content>
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

    if (this.state.isSelectionClicked) {
      bubbleContent = this.getConfirmationBubbleContent();
    } else {
      if (this.state.requestType === FervieLayout.HELP_REQUEST) {
        bubbleContent = this.getHelpLightBubbleContent();
      } else if (this.state.requestType === FervieLayout.HOTKEY_REQUEST) {
        bubbleContent = this.getPairingBubbleContent();
      } else {
        console.log("no request type sent!");
      }
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
