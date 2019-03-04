import React, { Component } from "react";
import Keyframes from "@keyframes/core";
import { RendererEventFactory } from "../RendererEventFactory";
import ConsoleLayout from "../components/ConsoleLayout";

//
// This View will contain logic to inject the various tabs of the
// console into the view. It will also manage the states of these
// views in an array.
//
export default class ConsoleView extends Component {
  /// sets up the event to listen for if the window is shown or hiden.
  /// Activates animation according
  constructor(props) {
    super(props);
    this.events = {
      load: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        this.onLoadCb
      )
    };
    let root = document.getElementById("root");
    root.style.transform = "translate(0px," + window.innerHeight * -1 + "px)";
    root.style.opacity = "0";
    this.keyframes = new Keyframes(root);
    Keyframes.define({
      name: "console-slidein",
      from: {
        transform: "translate(0px," + window.innerHeight * -1 + "px)",
        opacity: "0"
      },
      to: {
        transform: "translate(0px,0px)",
        opacity: "1"
      }
    });
    Keyframes.define({
      name: "console-slideout",
      from: {
        transform: "translate(0px,0px)",
        opacity: "1"
      },
      to: {
        transform: "translate(0px," + window.innerHeight * -1 + "px)",
        opacity: "0"
      }
    });
  }

  onLoadCb(event, arg) {
    console.log("[ConsoleView] event -> WINDOW_CONSOLE_SHOW_HIDE : " + arg);
    if (arg === 0) {
      this.keyframes.play({
        name: "console-slidein",
        duration: ".4s",
        timingFunction: "ease"
      });
    } else if (arg === 1) {
      this.keyframes.play({
        name: "console-slideout",
        duration: ".4s",
        timingFunction: "ease"
      });
    }
  }

  /// renders the component in the view
  render() {
    return (
      <div id="wrapper" className="console">
        <ConsoleLayout />
      </div>
    );
  }
}
