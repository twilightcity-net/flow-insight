import React, {Component} from "react";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import FerviePeekAnimation from "./fervie/FerviePeekAnimation";
import {Button, Icon, Popup} from "semantic-ui-react";
import {CodeClient} from "../clients/CodeClient";
import {FervieActionClient} from "../clients/FervieActionClient";
import JournalItem from "./console/content/journal/components/JournalItem";
import Mousetrap from "mousetrap";
import {act} from "react-dom/test-utils";
import ConfettiExplosion from 'react-confetti-explosion';
import FervieConfetti from "./fervie/FervieConfetti";

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
      isExploding: false
    }

  }

  static get FervieRequestType() {
    return {
      HELP: "help",
      CELEBRATE: "celebrate",
      HOTKEY: "hotkey"
    }
  }

  static HELP_REQUEST = "help";
  static HOTKEY_REQUEST = "hotkey";
  static ACTION_BUTTON_ID_PREFIX = "actionButton";

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

    this.consoleLinkNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.CONSOLE_LINK_EVENT,
        this
      );

    this.setKeyboardShortcuts();

    this.initButtonRefs();
  };

  initButtonRefs() {
    this.actionButtonRefs = [];
  }

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
    if (arg.request === FervieLayout.FervieRequestType.HELP) {
      this.setState({
        requestType: FervieLayout.FervieRequestType.HELP,
        requestInfo: {
          box: arg.message.boxName,
          module: arg.message.moduleName,
          circuitLink: "/wtf/" + arg.message.learningCircuitDto.circuitName
        },
        isSelectionClicked: false
      });
    } else if (arg.request === FervieLayout.FervieRequestType.CELEBRATE) {
      console.log("num stars = "+arg.message.numStars);
      this.setState({
        requestType: FervieLayout.FervieRequestType.CELEBRATE,
        requestInfo: {numStars: arg.message.numStars},
        isSelectionClicked: false
      });
    } else if (arg.request === FervieLayout.FervieRequestType.HOTKEY) {
      this.setState({
        requestType: FervieLayout.FervieRequestType.HOTKEY,
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
    this.fervieShowHideNotifier.clear();
    this.consoleLinkNotifier.clear();
    this.clearKeyboardShortcuts();

    this.actionButtonRefs = [];
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
    if (this.state.requestType === FervieLayout.FervieRequestType.HOTKEY) {
      this.initializeCodeState();
      this.initializeFervieActions();
    } else if (this.state.requestType === FervieLayout.FervieRequestType.HELP
    || this.state.requestType === FervieLayout.FervieRequestType.CELEBRATE) {
      //no init required, should be set already
      this.initializeFervieReady();
    }
  }

  initializeFervieReady() {
    setTimeout( () => {
      this.setState({
        error: null,
        isSpeechBubbleReady: true,
        isSelectionClicked: false,
        isExploding: true
      });
    }, 1000);
  }

  initializeFervieActions() {
    FervieActionClient.getAllFervieActions(this, (arg) => {
      if (arg.data) {
        console.log("Fervie actions returned");
        console.log(arg.data);
        this.setState({
          fervieActions: arg.data
        });
      }
    });
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

  /**
   * our string values of keyboard key names
   * @returns {{ESC: string, DOWN: string, LEFT: string, RIGHT: string, UP: string}}
   * @constructor
   */
  static get Keys() {
    return {
      UP: "up",
      DOWN: "down",
      ESC: "esc"
    };
  }

  /**
   * binds our keyboard shortcut to our callback. Called when the fervie popup is loaded
   */
  setKeyboardShortcuts() {
    Mousetrap.bind(
      FervieLayout.Keys.UP,
      this.handleKeyPressUp
    );
    Mousetrap.bind(
      FervieLayout.Keys.DOWN,
      this.handleKeyPressDown
    );
    Mousetrap.bind(
      FervieLayout.Keys.ESC,
      this.handleKeyPressEscape
    );
  }

  /**
   * clears keyboard shortcuts for our journal.
   */
  clearKeyboardShortcuts() {
    Mousetrap.unbind(FervieLayout.Keys.UP);
    Mousetrap.unbind(FervieLayout.Keys.DOWN);
    Mousetrap.unbind(FervieLayout.Keys.ESC);
  }

  /**
   * event handler for when the user presses the up arrow key with fervie up,
   * should change the active button selection similar to pressing tab
   * @param e
   * @param combo
   */
  handleKeyPressUp = (e, combo) => {
    console.log("press up");

    let activeFocusedElement = document.activeElement;
    let nextIndex = 0;

    if (activeFocusedElement && activeFocusedElement.nodeName === "BUTTON") {
      let index = this.getIndexFromActionButtonId(activeFocusedElement.id);
      nextIndex = this.decrementIndex(index);
    }

    this.focusButtonByIndex(nextIndex);
  };

  /**
   * event handler for when the user presses the down arrow key with fervie down,
   * should change the active button selection similar to pressing tab
   * @param e
   * @param combo
   */
  handleKeyPressDown = (e, combo) => {
    console.log("press down");

    let activeFocusedElement = document.activeElement;
    let nextIndex = 0;

    if (activeFocusedElement && activeFocusedElement.nodeName === "BUTTON") {
      let index = this.getIndexFromActionButtonId(activeFocusedElement.id);
      nextIndex = this.incrementIndex(index);
    }

    this.focusButtonByIndex(nextIndex);
  };

  focusButtonByIndex(index) {
    let el = document.getElementById(FervieLayout.ACTION_BUTTON_ID_PREFIX + index);
    el.focus();
  }

  incrementIndex(index) {
    if (index + 1 >= this.actionButtonRefs.length) {
      return 0;
    } else {
      return index + 1;
    }
  }

  decrementIndex(index) {
    if (index - 1 < 0) {
      return this.actionButtonRefs.length - 1;
    } else {
     return index - 1;
    }
  }

  getIndexFromActionButtonId(id) {
    return parseInt(id.substr(FervieLayout.ACTION_BUTTON_ID_PREFIX.length));
  }

  /**
   * event handler for when the user presses the escape arrow key with fervie up.
   * Should close the fervie popup
   * @param e
   * @param combo
   */
  handleKeyPressEscape = (e, combo) => {
    console.log("press escape");
    setTimeout(() => {
      this.fervieShowHideNotifier.dispatch({});
    }, 100);
  };

  capitalizeFirstLetter(name) {
      return name.charAt(0).toUpperCase() + name.slice(1);
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

    this.setState({
      isSelectionClicked: true
    });

    setTimeout(() => {
      this.consoleLinkNotifier.dispatch({link: circuitLink});
      this.fervieShowHideNotifier.dispatch({});
    }, 700);
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

  getYayBubbleContent() {
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
        <Popup.Content className="fervieYayContent">
          <div className="happyBig">
            Yay!
          </div>
        </Popup.Content>
      );
    }

    return (<Popup id="fervieTalkBubble" className="fervieCelebrateBubble"
                   position='bottom center'
                   inverted
                   offset={[250, 50]}
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
      this.configActionButtonRef(0);
      popupContent = (
        <Popup.Content className="fervieTalkContent">
          <div>
            Could you shed some light on this?
          </div>
          <div>
            <Button
              id={FervieLayout.ACTION_BUTTON_ID_PREFIX + 0}
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


  getCodeArea() {
    if (this.state.requestInfo.box && this.state.requestInfo.box !== "Default") {
      return this.state.requestInfo.box;
    } else {
      return "Recent";
    }
  }

  configActionButtonRef(index) {
    this.actionButtonRefs[index] = FervieLayout.ACTION_BUTTON_ID_PREFIX +index;
  }

  getActionOptionsContent() {
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
      this.configActionButtonRef(0);

      let extensionButtons = this.getFervieActionExtensionButtons();

      popupContent = (
        <Popup.Content className="fervieTalkContent">
          <div>
            How can I help?
          </div>
          <div>
            <Button
              id={FervieLayout.ACTION_BUTTON_ID_PREFIX + 0}
              className="bubbleButton"
              size="medium"
              color="grey"
              onClick={() => {
                this.onClickAreaOfCode("box", this.state.requestInfo.boxPath);
              }}
            >
              <Button.Content>Find me a Pair <br/><span className="small"> (Familiar with {this.getCodeArea()} Code)</span></Button.Content>
            </Button>
            {extensionButtons}

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

  onClickActionExtension(actionId) {
    FervieActionClient.runFervieAction(actionId, this, (arg) => {
      if (arg.error) {
        console.error("Error in running "+actionId + ":: "+arg.error);
        this.setState({
          error: arg.error
        });
      }
      else {
        console.log("Successfully ran "+actionId);
      }
    });
    setTimeout(() => {
      this.fervieShowHideNotifier.dispatch({});
    }, 700);

    this.setState({
      isSelectionClicked: true
    });
  }

  getFervieActionExtensionButtons() {
    let content = "";
    if (this.state.fervieActions) {
      return this.state.fervieActions.map((action, index) => {
        this.configActionButtonRef((index + 1));
        return (
          <Button
            id={FervieLayout.ACTION_BUTTON_ID_PREFIX + (index+1)}
            key={FervieLayout.ACTION_BUTTON_ID_PREFIX + (index + 1)}
            className="bubbleButton"
            size="medium"
            color="grey"
            onClick={() => {
              this.onClickActionExtension(action.actionId);
            }}
          >
            <Button.Content>{action.fervieButtonText}</Button.Content>
          </Button>
        );
      });
    } else {
      return content;
    }
  }

  onConfettiDone = () => {
     this.setState({
       isExploding: false
     });
    setTimeout(() => {
      this.fervieShowHideNotifier.dispatch({});
    }, 333);
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
      if (this.state.requestType === FervieLayout.FervieRequestType.HELP) {
        bubbleContent = this.getHelpLightBubbleContent();
      } else if (this.state.requestType === FervieLayout.FervieRequestType.HOTKEY) {
        bubbleContent = this.getActionOptionsContent();
      } else if (this.state.requestType === FervieLayout.FervieRequestType.CELEBRATE) {
        bubbleContent = this.getYayBubbleContent();
      } else {
        console.log("no request type sent!");
      }
    }

    return (
      <div id="component" className="fervieLayout" >
        {bubbleContent}
        {this.state.isExploding && <FervieConfetti count="10" onComplete={this.onConfettiDone}/>}
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
