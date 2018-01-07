import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import JournalLayout from "./JournalLayout";
import TroubleshootLayout from "./TroubleshootLayout";
import FlowLayout from "./FlowLayout";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLayout: "journal"
    };
    this.events = {
      consoleMenuChange: RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
        this,
        this.onConsoleMenuChangeCb
      )
    };
  }

  // dispatched when the console menu changes from user clicks
  onConsoleMenuChangeCb(event, arg) {
    console.log(arg);
    let newLayout = arg.new,
      oldLayout = arg.old;
    this.setState({ activeLayout: newLayout });
  }

  /// renders the content of the console view
  render() {
    return (
      <div id="component" className="consoleContent">
        <div id="wrapper" className="journalLayout">
          {this.state.activeLayout === "journal" && <JournalLayout />}
          {this.state.activeLayout === "troubleshoot" && <TroubleshootLayout />}
          {this.state.activeLayout === "flow" && <FlowLayout />}
        </div>
      </div>
    );
  }
}
