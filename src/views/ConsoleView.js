import React, { Component } from "react";
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
  }

  onLoadCb(event, arg) {
    console.log("[ConsoleView] event -> WINDOW_CONSOLE_SHOW_HIDE : " + arg);
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
