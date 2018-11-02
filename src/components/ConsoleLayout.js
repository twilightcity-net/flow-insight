import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import ConsoleSidebar from "./ConsoleSidebar";
import SpiritPanel from "./SpiritPanel";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";
import {DataStoreFactory} from "../DataStoreFactory";
import TeamPanel from "./TeamPanel";

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
      xpSummary: null,
      flameRating: 0,
      activePanel: "profile",
      consoleIsOpen: 0
    };
    this.animationTime = 700;
    this.events = {
      sidebarPanel: RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
        this,
        (event, arg) => {
          this.animateSidebarPanel(arg.show);
        }
      ),
      consoleOpen: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        (event, arg) => this.resetCb(event, arg)
      )
    };

    this.teamStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.TEAM_WITH_MEMBERS,
      this
    );

  }

  resetCb = (event, showHideFlag) => {
      this.log("RESET!!" );
      this.setState({
        consoleIsCollapsed : showHideFlag
      });
  };


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

  /// click the flame button, which either tries to do a +1 or -1
  adjustFlameCb = (flameDelta) => {
    this.log("Flame change :" + flameDelta);

    let flameRating = this.state.flameRating + flameDelta;
    if (flameRating > 5) {
      flameRating = 5;
    } else if (flameRating < -5) {
      flameRating = -5;
    }

    if (this.state.flameRating > 0 && flameDelta < 0) {
      flameRating = 0;
    }

    if (this.state.flameRating < 0 && flameDelta > 0) {
      flameRating = 0;
    }

    this.log("Old/New Flame rating :" + this.state.flameRating + "/" + flameRating);
    this.setState({
      flameRating : flameRating
    });
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
    this.refreshXP();
  };

  onFlameChangeCb = (flameRating) => {
    this.log("flame update: "+flameRating);

    this.setState({
      flameRating : flameRating
    });
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


  changeActiveSidePanel = (activeSidePanel) => {
    this.log("Changed panel! " + activeSidePanel);
    this.setState({
       activePanel: activeSidePanel
    });
  };

  /// renders the root console layout of the console view
  render() {

    const spiritPanelContent = <SpiritPanel
      xpSummary={this.state.xpSummary}
      flameRating={this.state.flameRating}
      adjustFlameCb={this.adjustFlameCb}
      loadStateCb={this.loadStateSidebarPanelCb}
      saveStateCb={this.saveStateSidebarPanelCb}
      width={this.state.sidebarPanelWidth}
      opacity={this.state.sidebarPanelOpacity}
    />;

    const teamPanelContent = <TeamPanel
      xpSummary={this.state.xpSummary}
      width={this.state.sidebarPanelWidth}
      opacity={this.state.sidebarPanelOpacity}
      loadStateCb={this.loadStateSidebarPanelCb}
      saveStateCb={this.saveStateSidebarPanelCb}
      teamStore={this.teamStore}
      consoleIsCollapsed={this.state.consoleIsCollapsed}
    />;

    let activePanel = null;

    if (this.state.activePanel === "profile") {
      activePanel = spiritPanelContent;
    } else if (this.state.activePanel === "messages" ) {
      activePanel = teamPanelContent;
    }

    const sidebarPanel = (
      <div
        id="wrapper"
        className="consoleSidebarPanel"
        style={{ width: this.state.sidebarPanelWidth }}
      >
        {activePanel}
      </div>
    );
    return (
      <div id="component" className="consoleLayout">
        <div id="wrapper" className="consoleSidebar">
          <ConsoleSidebar onChangeActiveSidePanel={this.changeActiveSidePanel}/>
        </div>
        {this.state.sidebarPanelVisible && sidebarPanel}
        <div id="wrapper" className="consoleContent">
          <ConsoleContent onXP={this.onXPCb} animationTime={this.animationTime} onFlameChange={this.onFlameChangeCb} updatedFlame={this.state.flameRating}/>
        </div>

        <div id="wrapper" className="consoleMenu">
          <ConsoleMenu animationTime={this.animationTime} />
        </div>
      </div>
    );
  }
}
