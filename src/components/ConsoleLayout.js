import React, { Component } from "react";
import { RendererEvent } from "../RendererEventManager";
import { RendererEventManagerHelper } from "../RendererEventManagerHelper";
import ConsoleSidebar from "./ConsoleSidebar";
import ConsoleSidebarPanel from "./ConsoleSidebarPanel";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleLayout extends Component {
  constructor(props) {
    super(props);
    this.events = {
      sidebarPanel: new RendererEvent(
        RendererEventManagerHelper.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
        this,
        function(event, arg) {
          console.log(arg);
        }
      )
    };
  }

  /// renders the root console layout of the console view
  render() {
    return (
      <div id="component" className="consoleLayout">
        <div id="wrapper" className="consoleSidebar">
          <ConsoleSidebar />
        </div>

        {true && (
          <div id="wrapper" className="consoleSidebarPanel">
            <ConsoleSidebarPanel />
          </div>
        )}

        <div id="wrapper" className="consoleContent">
          <ConsoleContent />
        </div>

        <div id="wrapper" className="consoleMenu">
          <ConsoleMenu />
        </div>
      </div>
    );
  }
}
