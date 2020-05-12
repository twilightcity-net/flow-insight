import React, { Component } from "react";
import Keyframes from "@keyframes/core";
import ConsoleLayout from "../layout/ConsoleLayout";
import { RendererControllerFactory } from "../controllers/RendererControllerFactory";
import { DimensionController } from "../controllers/DimensionController";
import { CircuitClient } from "../clients/CircuitClient";
import { TalkClient } from "../clients/TalkClient";
import { TalkToClient } from "../clients/TalkToClient";
import { JournalClient } from "../clients/JournalClient";
import { TeamClient } from "../clients/TeamClient";
import { MemberClient } from "../clients/MemberClient";

/**
 * This View will contain logic to inject the various tabs of the
 * console into the view. It will also manage the states of these
 * views in an array.
 */
export default class ConsoleView extends Component {
  /**
   * the amount of time to animate the console view when opening the window
   * @type {number}
   */
  static animationTime = 0.4;

  /**
   * this is the type of animation css class to use to slide the console in
   * @type {string}
   */
  static animationTypeIn = "console-slidein";

  /**
   * this is the type of animation css class to use to slide the console out
   * @type {string}
   */
  static animationTypeOut = "console-slideout";

  /**
   * the css scalar to apply the animation vector to
   * @type {string}
   */
  static animationTiming = "ease";

  /**
   * the global animation states for the console window
   * @returns {{HIDE_CONSOLE: number, SHOW_CONSOLE: number}}
   */
  static get ConsoleStates() {
    return {
      SHOW_CONSOLE: 0,
      HIDE_CONSOLE: 1
    };
  }
  /**
   * sets up the event to listen for if the window is shown or hiden.
   * Activates animation according
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ConsoleView]";
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_VIEW,
      this
    );

    let root = document.getElementById("root");
    root.style.transform =
      "translate(0px," + window.innerHeight * -1 + "px)";
    root.style.opacity = "0";
    this.keyframes = new Keyframes(root);
    Keyframes.define({
      name: ConsoleView.animationTypeIn,
      from: {
        transform:
          "translate(0px," +
          window.innerHeight * -1 +
          "px)",
        opacity: "0"
      },
      to: {
        transform: "translate(0px,0px)",
        opacity: "1"
      }
    });
    Keyframes.define({
      name: ConsoleView.animationTypeOut,
      from: {
        transform: "translate(0px,0px)",
        opacity: "1"
      },
      to: {
        transform:
          "translate(0px," +
          window.innerHeight * -1 +
          "px)",
        opacity: "0"
      }
    });
  }

  componentDidMount = () => {
    this.myController.configureConsoleViewListener(
      this,
      this.onLoadCb
    );
    TalkClient.init(this);
    TalkToClient.init(this);
    TeamClient.init(this);
    MemberClient.init(this);
    JournalClient.init(this);
    CircuitClient.init(this);
    DimensionController.init(this);
  };

  componentWillUnmount = () => {
    this.myController.configureConsoleViewListener(
      this,
      null
    );
  };

  /**
   * called when this view is initially loaded. when arg = 1 the console is sliding in
   * from a hidden state
   * @param event
   * @param arg
   */
  onLoadCb(event, arg) {
    if (arg === ConsoleView.ConsoleStates.SHOW_CONSOLE) {
      this.keyframes.play({
        name: ConsoleView.animationTypeIn,
        duration: ConsoleView.animationTime + "s",
        timingFunction: ConsoleView.animationTiming
      });
    } else if (
      arg === ConsoleView.ConsoleStates.HIDE_CONSOLE
    ) {
      this.keyframes.play({
        name: ConsoleView.animationTypeOut,
        duration: ConsoleView.animationTime + "s",
        timingFunction: ConsoleView.animationTiming
      });
    }
  }

  /**
   * renders the component in the view
   * @returns {*}
   */
  render() {
    return (
      <div id="wrapper" className="console">
        <ConsoleLayout />
      </div>
    );
  }
}
