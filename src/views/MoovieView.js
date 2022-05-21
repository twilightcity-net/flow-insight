import React, {Component} from "react";
import Keyframes from "@keyframes/core";
import {TalkToClient} from "../clients/TalkToClient";
import {MoovieClient} from "../clients/MoovieClient";
import ChatConsoleLayout from "../layout/ChatConsoleLayout";
import {RendererEventFactory} from "../events/RendererEventFactory";

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
    }

    this.isHiding = false;
    this.isOpening = false;
    this.isOpen = false;
  };

  componentWillUnmount = () => {
  };



  onConsoleShown = () => {
    console.log("On console shown!");
    this.isOpen = true;
    this.isOpening = false;
    this.isHiding = false;
  }


  onConsoleHidden = () => {
    console.log("On console hidden!");
    this.isOpen = false;
    this.isOpening = false;
    this.isHiding = false;
  }

  onConsoleBlur = () => {
    console.log("On console blur!");
    this.isHiding = true;
    this.playAnimateOut();
  }


  onMouseOverIcon = () => {
    console.log("mouseOverIcon!");

    if (!this.isOpening && !this.isOpen) {
      this.isOpening = true;
      setTimeout(() => {

        let root = document.getElementById("root");
        root.style.transform = "translate(400px, 0px)";
        root.style.opacity = "0";

        this.events.consoleShowHide.dispatch({show: 1});
        this.playAnimateIn();
      }, 333);
    }
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
        <ChatConsoleLayout moovieId={this.props.routeProps.moovieId} onMouseOverIcon={this.onMouseOverIcon}/>
      </div>
    );
  }
}
