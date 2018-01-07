import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import JournalLayout from "./JournalLayout";
import TroubleshootLayout from "./TroubleshootLayout";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
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
  }

  /// renders the content of the console view
  render() {
    return (
      <div id="component" className="consoleContent">
        <div id="wrapper" className="journalLayout">
          {true && <JournalLayout />}
          {false && <TroubleshootLayout />}
        </div>
      </div>
    );
  }
}
