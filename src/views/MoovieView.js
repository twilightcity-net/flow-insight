import React, {Component} from "react";
import Keyframes from "@keyframes/core";
import {TalkToClient} from "../clients/TalkToClient";
import {MoovieClient} from "../clients/MoovieClient";
import MoovieChatLayout from "../layout/MoovieChatLayout";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {MemberClient} from "../clients/MemberClient";
import {CircuitMemberClient} from "../clients/CircuitMemberClient";
import {FervieClient} from "../clients/FervieClient";
import {AccountClient} from "../clients/AccountClient";

/**
 * This View will contain the invisible chat window that floats on top of the moovie,
 * should be able to slide in and out from the side, so the invisible window isn't permanently
 * blocking click through.
 */
export default class MoovieView extends Component {
  /**
   * the amount of time to animate the moovie view when opening the window
   * @type {number}
   */
  static animationTime = 0.4;

  /**
   * this is the animation css class to use to slide the moovie console window in
   * @type {string}
   */
  static animationTypeIn = "moovie-slidein";

  /**
   * this is the animation css class to use to slide the moovie console window out
   * @type {string}
   */
  static animationTypeOut = "moovie-slideout";

  static animationTypeMontyBackOut = "monty-back-out";

  static animationTypeMontySlideIn = "monty-slide-in";


  /**
   * the css scalar to apply the animation vector to
   * @type {string}
   */
  static animationTiming = "ease";

  constructor(props) {
    super(props);
    this.name = "[MoovieView]";

    TalkToClient.init(this);
    MoovieClient.init(this);
    MemberClient.init(this);
    CircuitMemberClient.init(this);
    FervieClient.init(this);
    AccountClient.init(this);

    this.isOpen = false;
    this.isOpening = false;
    this.isHiding = false;

    this.state = {
      isOpen : false,
      showPeekView: false
    }
  }

  componentDidMount = () => {
    console.log("moovieId = "+this.props.routeProps.moovieId);
    let root = document.getElementById("root");
    root.style.border = "0px";

    this.chatWindowKeyframes = new Keyframes(root);
    Keyframes.define({
      name: MoovieView.animationTypeIn,
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
      name: MoovieView.animationTypeOut,
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
      name: MoovieView.animationTypeMontyBackOut,
      from: {
        transform: "translate(50px,0px)",
        opacity: "0",
      },
      to: {
        transform: "translate(0px, 0px)",
        opacity: "1",
      },
    });

    let montyIcon = document.getElementById("montyIcon");
    this.montyKeyframes = new Keyframes(montyIcon);

    Keyframes.define({
      name: MoovieView.animationTypeMontySlideIn,
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
        RendererEventFactory.Events.WINDOW_MOOVIE_CONSOLE_SHOW_HIDE,
        this
      ),
      consoleShown: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_MOOVIE_CONSOLE_SHOWN,
        this,
        this.onConsoleShown
      ),
      consoleHidden: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_MOOVIE_CONSOLE_HIDDEN,
        this,
        this.onConsoleHidden
      ),
      consoleBlur: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_MOOVIE_CONSOLE_BLUR,
        this,
        this.onConsoleBlur
      ),
      windowClose: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CLOSE_MOOVIE,
        this
      ),

    }

    this.isHiding = false;
    this.isOpening = false;
    this.isOpen = false;

    setTimeout(() => {
      this.slideOpenWindow();
    }, 2000);
  };

  componentWillUnmount = () => {
    this.events.consoleShowHide.clear();
    this.events.consoleShown.clear();
    this.events.consoleHidden.clear();
    this.events.consoleBlur.clear();
    this.events.windowClose.clear();
  };

  onConsoleShown = () => {
    this.isOpen = true;
    this.isOpening = false;
    this.isHiding = false;

    this.setState({
      isOpen: true
    });
  }

  onConsoleHidden = () => {
    this.isOpen = false;
    this.isOpening = false;
    this.isHiding = false;

    this.setState({
      isOpen: false
    });
  }

  onConsoleBlur = () => {
    if (this.isOpen) {
      this.isHiding = true;
      this.playAnimateOut();

      setTimeout(() => {
        console.log("showPeekView: false");
        this.setState({
          showPeekView: false
        });
      }, 400);
    }

  }

  onClickMonty = () => {
    console.log("onClickMonty!");

    this.slideOpenWindow();
  }

  onActivateFullChatWindow = () => {
    console.log("2clear timeout");
    clearTimeout(this.peekWindowTimeout);
    this.setState({
      showPeekView: false
    });
  }

  onTyping = () => {
    this.resetTimeoutForClosingPeekWindow();
  }

  onMessageSlideWindow = () => {
    console.log("onMessage peek window!");

    console.log("clear timeout");

    if (!this.isOpening && !this.isOpen) {
      this.setState({
        showPeekView: true
      });
      this.slideOpenWindow();
      this.resetTimeoutForClosingPeekWindow();
    } else {
      this.resetTimeoutForClosingPeekWindow();
    }
  }

  resetTimeoutForClosingPeekWindow() {
    clearTimeout(this.peekWindowTimeout);
    console.log("set new timeout");
    this.peekWindowTimeout = setTimeout(() => {
      console.log("slide closed");
      this.slideCloseWindow();
      setTimeout(() => {
        console.log("2showPeekView: false");
        this.setState({
          showPeekView: false
        });
      }, 400);
    }, 7000);
  }

  slideOpenWindow() {
    if (!this.isOpening && !this.isOpen) {
      this.isOpening = true;
      let root = document.getElementById("root");
      root.style.transform = "translate(400px, 0px)";
      root.style.opacity = "0";
      this.playAnimateIn();
      setTimeout(() => {
        //delaying the event slightly keeps the visualization from glitching
        this.events.consoleShowHide.dispatch({show: 1});
      }, 50);
    }
  }

  slideCloseWindow() {
    if (this.isOpen && !this.isHiding) {
      this.events.consoleShowHide.dispatch({show: 0});
      this.isHiding = true;
      this.playAnimateOut();
    }
  }

  onMontyExit = () => {
    this.events.windowClose.dispatch({});
  }

  playMontyIn() {
    this.montyKeyframes.play({
      name: MoovieView.animationTypeMontySlideIn,
      duration: MoovieView.animationTime + "s",
      timingFunction: MoovieView.animationTiming,
    });
  }

  playAnimateIn() {
    this.chatWindowKeyframes.play({
      name: MoovieView.animationTypeIn,
      duration: MoovieView.animationTime + "s",
      timingFunction: MoovieView.animationTiming,
    });
  }

  playAnimateOut() {
    this.chatWindowKeyframes.play({
      name: MoovieView.animationTypeOut,
      duration: MoovieView.animationTime + "s",
      timingFunction: MoovieView.animationTiming,
    });
    setTimeout(() => {
      this.chatWindowKeyframes.play({
        name: MoovieView.animationTypeMontyBackOut,
        duration: MoovieView.animationTime + "s",
        timingFunction: MoovieView.animationTiming,
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
        <MoovieChatLayout
          moovieId={this.props.routeProps.moovieId}
          isConsoleOpen={this.state.isOpen}
          onClickMonty={this.onClickMonty}
          onMontyExit={this.onMontyExit}
          showPeekView={this.state.showPeekView}
          onTyping={this.onTyping}
          onMessageSlideWindow={this.onMessageSlideWindow}
          onActivateFullChatWindow={this.onActivateFullChatWindow}/>
      </div>
    );
  }
}
