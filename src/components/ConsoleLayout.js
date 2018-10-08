import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import ConsoleSidebar from "./ConsoleSidebar";
import ConsoleSidebarPanel from "./ConsoleSidebarPanel";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";
import {DataStoreFactory} from "../DataStoreFactory";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");


//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarPanelVisible: false,
      sidebarPanelWidth: 0,
      sidebarPanelOpacity: 0,
      xpSummary: null
    };
    this.animationTime = 700;
    this.events = {
      sidebarPanel: RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
        this,
        (event, arg) => {
          this.animateSidebarPanel(arg.show);
        }
      )
    };
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  /// visually show the panel in the display
  animateSidebarPanel(show) {
    if (show) {
      this.setState({ sidebarPanelVisible: true });
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
        this.setState({ sidebarPanelVisible: false });
      }, 420);
    }
  }

  /// store child component for future reloading
  saveStateSidebarPanelCb = state => {
    this.setState({ sidebarPanelState: state });
  };

  /// load the child components state from this state
  loadStateSidebarPanelCb = () => {
    return this.state.sidebarPanelState;
  };

  componentDidMount = () => {
    this.log("ConsoleLayout : componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.XP_SUMMARY,
      this
    );

    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
  };

  onStoreLoadCb = (err) => {
    this.log("ConsoleLayout : onStoreLoadCb");
    if (err) {
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let xpSummaryDto = this.store.dto;

      this.setState({
        xpSummary: xpSummaryDto,
        level: xpSummaryDto.level,
        percentXP: Math.round((xpSummaryDto.xpProgress / xpSummaryDto.xpRequiredToLevel) * 100),
        totalXP: xpSummaryDto.totalXP,
        title: xpSummaryDto.title
      });


      this.log("Success!");
    }
  };

  onXPCb = () => {
    this.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
    this.refreshXP();
  };

  refreshXP = () => {
    this.log("ConsoleSidebarPanel : refreshXP");
    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
  };


  /// renders the root console layout of the console view
  render() {
    const sidebarPanel = (
      <div
        id="wrapper"
        className="consoleSidebarPanel"
        style={{ width: this.state.sidebarPanelWidth }}
      >
        <ConsoleSidebarPanel
          xpSummary={this.state.xpSummary}
          loadStateCb={this.loadStateSidebarPanelCb}
          saveStateCb={this.saveStateSidebarPanelCb}
          width={this.state.sidebarPanelWidth}
          opacity={this.state.sidebarPanelOpacity}
        />
      </div>
    );
    return (
      <div id="component" className="consoleLayout">
        <div id="wrapper" className="consoleSidebar">
          <ConsoleSidebar />
        </div>
        {this.state.sidebarPanelVisible && sidebarPanel}
        <div id="wrapper" className="consoleContent">
          <ConsoleContent onXP={this.onXPCb} animationTime={this.animationTime} />
        </div>

        <div id="wrapper" className="consoleMenu">
          <ConsoleMenu animationTime={this.animationTime} />
        </div>
      </div>
    );
  }
}
