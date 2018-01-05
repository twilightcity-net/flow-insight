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
    this.state = {
      sidebarPanelVisible: false,
      sidebarPanelWidth: 0,
      sidebarPanelOpacity: 0
    };
    this.events = {
      sidebarPanel: new RendererEvent(
        RendererEventManagerHelper.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
        this,
        function(event, arg) {
          this.animateSidebarPanel(arg.show);
        }
      )
    };
  }

  animateSidebarPanel(show) {
    if (show) {
      this.setState({
        sidebarPanelVisible: true
      });
      setTimeout(() => {
        this.setState({
          sidebarPanelWidth: 300,
          sidebarPanelOpacity: 0.96
        });
      }, 0);
    } else {
      this.setState({
        sidebarPanelWidth: 0,
        sidebarPanelOpacity: 0
      });
      setTimeout(() => {
        this.setState({
          sidebarPanelVisible: false
        });
      }, 1000);
    }
  }

  /// renders the root console layout of the console view
  render() {
    return (
      <div id="component" className="consoleLayout">
        <div id="wrapper" className="consoleSidebar">
          <ConsoleSidebar />
        </div>

        {this.state.sidebarPanelVisible && (
          <div
            id="wrapper"
            className="consoleSidebarPanel"
            style={{ width: this.state.sidebarPanelWidth }}
          >
            <ConsoleSidebarPanel
              width={this.state.sidebarPanelWidth}
              opacity={this.state.sidebarPanelOpacity}
            />
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
