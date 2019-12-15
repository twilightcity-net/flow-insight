import React, { Component } from "react";
import Keyframes from "@keyframes/core";
import ConsoleLayout from "../components/console/ConsoleLayout";
import { ActiveViewControllerFactory } from "../controllers/ActiveViewControllerFactory";
import { ModelCoordinator } from "../models/ModelCoordinator";
import { PerspectiveController } from "../controllers/PerspectiveController";
import { DimensionController } from "../controllers/DimensionController";

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
    this.name = "[ConsoleView]";
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.CONSOLE_PANEL,
      this
    );

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

  componentDidMount = () => {
    console.log(this.name + " did mount");
    this.myController.configureConsoleViewListener(this, this.onLoadCb);
    ModelCoordinator.init(this);
    PerspectiveController.init(this);
    DimensionController.init(this);
  };

  componentWillUnmount = () => {
    this.myController.configureConsoleViewListener(this, null);
  };

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
