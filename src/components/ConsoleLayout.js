import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import ConsoleSidebar from "./ConsoleSidebar";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";
import { DataStoreFactory } from "../DataStoreFactory";
import TeamPanel from "./TeamPanel";
import SpiritPanel from "./SpiritPanel";
import {DataModelFactory} from "../models/DataModelFactory";
import TroubleshootLayout from "./TroubleshootLayout";

const { remote } = window.require("electron");

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
      consoleIsCollapsed: 0,
      me: {},
      teamMembers: [],
      activeTeamMember: null
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

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this);

    this.teamModel.registerCallbackOnUpdate(this.onTeamModelUpdateCb);

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this);

    this.activeCircleModel.registerCallbackOnUpdate(this.onActiveCircleUpdateCb);

  }

  resetCb = (event, showHideFlag) => {
    this.log("RESET!!");
    this.setState({
      consoleIsCollapsed: showHideFlag
    });

    if (showHideFlag == false) {
      this.teamModel.refreshAll();
    }
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
  adjustFlameCb = flameDelta => {
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

    this.log(
      "Old/New Flame rating :" + this.state.flameRating + "/" + flameRating
    );
    this.setState({
      flameRating: flameRating
    });
  };

  componentDidMount = () => {
    this.log("ConsoleLayout : componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.XP_SUMMARY,
      this
    );

    this.store.load(null, err => {
      setTimeout(() => {
        this.onStoreLoadCb(err);
      }, this.activateWaitDelay);
    });

    this.teamModel.refreshAll();
    this.activeCircleModel.loadActiveCircle();

    setTimeout(() => {
      this.animateSidebarPanel(true);
    }, 500);
  };

  onTeamModelUpdateCb = () => {
    this.log("ConsoleLayout : onTeamModelUpdateCb");
    this.setState({
      me: this.teamModel.me,
      teamMembers: this.teamModel.teamMembers,
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  onActiveCircleUpdateCb = () => {
    this.log("ConsoleLayout : onActiveCircleUpdateCb");
    this.setState({
      activeCircleId: this.activeCircleModel.activeCircleId,
      activeCircle: this.activeCircleModel.activeCircle,
      isAlarmTriggered: this.activeCircleModel.isAlarmTriggered
    });

    this.teamModel.refreshMe();
  };

  onSetActiveMember = (id) => {
    this.log("ConsoleLayout : onSetActiveMember");
    this.teamModel.setActiveMember(id);
    this.setState({
        activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  onStoreLoadCb = err => {
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
        percentXP: Math.round(
          (xpSummaryDto.xpProgress / xpSummaryDto.xpRequiredToLevel) * 100
        ),
        totalXP: xpSummaryDto.totalXP,
        title: xpSummaryDto.title
      });

      this.log("Success!");
    }
  };

  onXPCb = () => {
    this.refreshXP();
  };

  onUpdateMeCb = () => {
    this.teamModel.refreshMe();
  };

  onFlameChangeCb = flameRating => {
    this.log("flame update: " + flameRating);

    this.setState({
      flameRating: flameRating
    });
  };


  refreshXP = () => {
    this.log("ConsoleSidebarPanel : refreshXP");
    this.store.load(null, err => {
      setTimeout(() => {
        this.onStoreLoadCb(err);
      }, this.activateWaitDelay);
    });
  };

  changeActiveSidePanel = activeSidePanel => {
    this.log("Changed panel! " + activeSidePanel);
    this.setState({
      activePanel: activeSidePanel
    });
  };

  /// renders the root console layout of the console view
  render() {
    const animatedPanelContent = (
      <SpiritPanel
        xpSummary={this.state.xpSummary}
        flameRating={this.state.flameRating}
        adjustFlameCb={this.adjustFlameCb}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
      />
    );

    const teamPanelContent = (
      <TeamPanel
        xpSummary={this.state.xpSummary}
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
        me={this.state.me}
        teamMembers={this.state.teamMembers}
        activeTeamMember={this.state.activeTeamMember}
        setActiveMember={this.onSetActiveMember}
        consoleIsCollapsed={this.state.consoleIsCollapsed}
      />
    );

    let activePanel = null;

    if (this.state.activePanel === "profile") {
      activePanel = animatedPanelContent;
    } else if (this.state.activePanel === "messages") {
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
          <ConsoleSidebar
            onChangeActiveSidePanel={this.changeActiveSidePanel}
          />
        </div>
        {this.state.sidebarPanelVisible && sidebarPanel}
        <div id="wrapper" className="consoleContent">
          <ConsoleContent
            consoleIsCollapsed={this.state.consoleIsCollapsed}
            onXP={this.onXPCb}
            onUpdateMe={this.onUpdateMeCb}
            animationTime={this.animationTime}
            onFlameChange={this.onFlameChangeCb}
            updatedFlame={this.state.flameRating}
            onAdjustFlame={this.adjustFlameCb}
            isAlarmTriggered={this.state.isAlarmTriggered}
            activeCircle={this.state.activeCircle}
          />
        </div>

        <div id="wrapper" className="consoleMenu">
          <ConsoleMenu animationTime={this.animationTime} />
        </div>
      </div>
    );
  }
}
