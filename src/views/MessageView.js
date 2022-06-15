import React, {Component} from "react";
import Keyframes from "@keyframes/core";
import {TalkToClient} from "../clients/TalkToClient";
import {MoovieClient} from "../clients/MoovieClient";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {MemberClient} from "../clients/MemberClient";
import {CircuitMemberClient} from "../clients/CircuitMemberClient";
import {FervieClient} from "../clients/FervieClient";
import DMLayout from "../layout/DMLayout";
import {NotificationClient} from "../clients/NotificationClient";

/**
 * This View will contain the invisible chat window that floats on top for chatting with buddies,
 * should be able to slide in and out from the side, so the invisible window isn't permanently
 * blocking click through.
 */
export default class MessageView extends Component {
  /**
   * the amount of time to animate the message view when opening the window
   * @type {number}
   */
  static animationTime = 0.4;

  /**
   * this is the animation css class to use to slide the message console window in
   * @type {string}
   */
  static animationTypeIn = "dm-slidein";

  /**
   * this is the animation css class to use to slide the message console window out
   * @type {string}
   */
  static animationTypeOut = "dm-slideout";

  static animationTypeIconBackOut = "icon-back-out";

  static animationTypeIconSlideIn = "icon-slide-in";

  static fervieIcon = "fervieIcon";

  /**
   * the css scalar to apply the animation vector to
   * @type {string}
   */
  static animationTiming = "ease";

  constructor(props) {
    super(props);
    this.name = "[MessageView]";

    TalkToClient.init(this);
    MoovieClient.init(this);
    MemberClient.init(this);
    CircuitMemberClient.init(this);
    FervieClient.init(this);
    NotificationClient.init(this);

    this.isOpen = false;
    this.isOpening = false;
    this.isHiding = false;

    this.state = {
      isOpen : false,
      showPeekView: false
    }
  }

  componentDidMount = () => {
    let root = document.getElementById("root");
    root.style.border = "0px";

    this.chatWindowKeyframes = new Keyframes(root);
    Keyframes.define({
      name: MessageView.animationTypeIn,
      from: {
        transform: "translate(400px, 0px)",
        opacity: "0",
      },
      to: {
        transform: "translate(0px,0px)",
        opacity: "1",
      },
    });
    Keyframes.define({
      name: MessageView.animationTypeOut,
      from: {
        transform: "translate(0px,0px)",
        opacity: "1",
      },
      to: {
        transform: "translate(400px, 0px)",
        opacity: "0",
      },
    });
    Keyframes.define({
      name: MessageView.animationTypeIconBackOut,
      from: {
        transform: "translate(50px,0px)",
        opacity: "0",
      },
      to: {
        transform: "translate(0px, 0px)",
        opacity: "1",
      },
    });

    let fervieIcon = document.getElementById(MessageView.fervieIcon);
    this.iconKeyframes = new Keyframes(fervieIcon);

    Keyframes.define({
      name: MessageView.animationTypeIconSlideIn,
      from: {
        transform: "translate(0px,0px)",
        opacity: "1",
      },
      to: {
        transform: "translate(50px, 0px)",
        opacity: "0",
      },
    });

    this.events = {
      consoleShowHide: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CHAT_CONSOLE_SHOW_HIDE,
        this
      ),
      consoleShown: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CHAT_CONSOLE_SHOWN,
        this,
        this.onConsoleShown
      ),
      consoleHidden: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CHAT_CONSOLE_HIDDEN,
        this,
        this.onConsoleHidden
      ),
      consoleBlur: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CHAT_CONSOLE_BLUR,
        this,
        this.onConsoleBlur
      ),
      windowClose: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_DM,
        this
      ),

    }

    this.isHiding = false;
    this.isOpening = false;
    this.isOpen = false;

    if (this.getBoolValue(this.props.routeProps.autoSlideOpen)) {
      setTimeout(() => {
        this.slideOpenWindow();
      }, 2000);
    }
  };

  getBoolValue(boolStrProp) {
    if (boolStrProp === "true") {
      return true;
    } else {
      return false;
    }
  }

  componentWillUnmount = () => {
      this.events.consoleShowHide.clear();
      this.events.consoleShown.clear();
      this.events.consoleHidden.clear();
      this.events.consoleBlur.clear();
      this.events.windowClose.clear();
  };

  onConsoleShown = (event, arg) => {
    console.log("onConsoleShown");
    if (arg.memberId === this.props.routeProps.memberId) {
      this.isOpen = true;
      this.isOpening = false;
      this.isHiding = false;

      this.setState({
        isOpen: true
      });
    }
  }

  onConsoleHidden = (event, arg) => {
    console.log("onConsoleHidden");
    if (arg.memberId === this.props.routeProps.memberId) {
      this.isOpen = false;
      this.isOpening = false;
      this.isHiding = false;

      this.setState({
        isOpen: false
      });
    }
  }

  onConsoleBlur = (event, arg) => {
    console.log("onConsoleBlur");
    if (arg.memberId === this.props.routeProps.memberId) {
      if (this.isOpen) {
        this.isHiding = true;
        this.playAnimateOut();

        setTimeout(() => {
          this.setState({
            showPeekView: false
          });
        }, 400);
      }
    }
  }

  onClickAppIcon = () => {
    console.log("onClickIcon!");

    this.slideOpenWindow();
  }

  onActivateFullChatWindow = () => {
    clearTimeout(this.peekWindowTimeout);
    this.setState({
      showPeekView: false
    });
  }

  onMessageSlideWindow = () => {
    console.log("onMessage peek window!");

    clearTimeout(this.peekWindowTimeout);

    if (!this.isOpening && !this.isOpen) {
      this.setState({
        showPeekView: true
      });
      this.slideOpenWindow();

      this.peekWindowTimeout = setTimeout(() => {
        this.slideCloseWindow();
        setTimeout(() => {
          this.setState({
            showPeekView: false
          });
        }, 400);
      }, 7000);
    }

  }

  slideOpenWindow() {
    console.log("slideOpenWindow");
    if (!this.isOpening && !this.isOpen) {
      this.isOpening = true;
      let root = document.getElementById("root");
      root.style.transform = "translate(400px, 0px)";
      root.style.opacity = "0";
      this.playAnimateIn();
      setTimeout(() => {
        //delaying the event slightly keeps the visualization from glitching
        this.events.consoleShowHide.dispatch({memberId: this.props.routeProps.memberId, show: 1});
      }, 50);
    }
  }

  slideCloseWindow() {
    if (this.isOpen && !this.isHiding) {
      this.events.consoleShowHide.dispatch({memberId: this.props.routeProps.memberId, show: 0});
      this.isHiding = true;
      this.playAnimateOut();
    }
  }

  onAppExit = () => {
    console.log("on app exit!");

    this.events.windowClose.dispatch({memberId: this.props.routeProps.memberId});
  }

  playMontyIn() {
    this.iconKeyframes.play({
      name: MessageView.animationTypeIconSlideIn,
      duration: MessageView.animationTime + "s",
      timingFunction: MessageView.animationTiming,
    });
  }

  playAnimateIn() {
    this.chatWindowKeyframes.play({
      name: MessageView.animationTypeIn,
      duration: MessageView.animationTime + "s",
      timingFunction: MessageView.animationTiming,
    });
  }

  playAnimateOut() {
    this.chatWindowKeyframes.play({
      name: MessageView.animationTypeOut,
      duration: MessageView.animationTime + "s",
      timingFunction: MessageView.animationTiming,
    });
    setTimeout(() => {
      this.chatWindowKeyframes.play({
        name: MessageView.animationTypeIconBackOut,
        duration: MessageView.animationTime + "s",
        timingFunction: MessageView.animationTiming,
      });
    }, 400);
  }

  /**
   * renders the component in the view
   * @returns {*}
   */
  render() {

    return (
      <div id="wrapper" className="moovie">
        <DMLayout
          memberId={this.props.routeProps.memberId}
          isConsoleOpen={this.state.isOpen}
          onClickAppIcon={this.onClickAppIcon}
          onAppExit={this.onAppExit}
          showPeekView={this.state.showPeekView}
          onMessageSlideWindow={this.onMessageSlideWindow}
          onActivateFullChatWindow={this.onActivateFullChatWindow}
          isAutoSlideOpen={this.getBoolValue(this.props.routeProps.autoSlideOpen)}
        />
      </div>
    );
  }
}
