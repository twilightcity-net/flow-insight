import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import JournalLayout from "./JournalLayout";
import TroubleshootLayout from "./TroubleshootLayout";
import FlowLayout from "./FlowLayout";
import { Transition } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLayout: "journal",
      journalVisible: true,
      troubleshootVisible: false,
      flowVisible: false,
      animationType: "fly left",
      animationDelay: 1000
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
    if (newLayout === "journal") {
      this.setState({
        activeLayout: newLayout,
        journalVisible: true,
        troubleshootVisible: false,
        flowVisible: false
      });
    } else if (newLayout === "troubleshoot") {
      this.setState({
        activeLayout: newLayout,
        journalVisible: false,
        troubleshootVisible: true,
        flowVisible: false
      });
    } else if (newLayout === "flow") {
      this.setState({
        activeLayout: newLayout,
        journalVisible: false,
        troubleshootVisible: false,
        flowVisible: true
      });
    }
  }

  /// renders the content of the console view
  render() {
    const journalLayout = (
      <div id="wrapper" className="journalLayout">
        <JournalLayout />
      </div>
    );
    const troubleshootLayout = (
      <div id="wrapper" className="troubleshootLayout">
        <TroubleshootLayout />
      </div>
    );
    const flowLayout = (
      <div id="wrapper" className="flowLayout">
        <FlowLayout />
      </div>
    );
    return (
      <div id="component" className="consoleContent">
        {this.state.journalVisible && journalLayout}
        {this.state.troubleshootVisible && troubleshootLayout}
        {this.state.flowVisible && flowLayout}
      </div>
    );
  }
}
