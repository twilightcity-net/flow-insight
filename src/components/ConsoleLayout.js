import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import ConsoleSidebar from "./ConsoleSidebar";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";
import TeamPanel from "./TeamPanel";
import SpiritPanel from "./SpiritPanel";
import { DataModelFactory } from "../models/DataModelFactory";
import { SpiritModel } from "../models/SpiritModel";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { TeamMembersModel } from "../models/TeamMembersModel";
import {ModelCoordinator} from "../models/ModelCoordinator";

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
      this
    );
    this.teamModel.registerListener(
      "consoleLayout",
      TeamMembersModel.CallbackEvent.MEMBERS_UPDATE,
      this.onTeamModelUpdateCb
    );
    this.teamModel.registerListener(
      "consoleLayout",
      TeamMembersModel.CallbackEvent.ACTIVE_MEMBER_UPDATE,
      this.onActiveMemberUpdateCb
    );

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
    this.activeCircleModel.registerListener(
      "consoleLayout",
      ActiveCircleModel.CallbackEvent.CIRCLE_UPDATE,
      this.onActiveCircleUpdateCb
    );

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );
    this.spiritModel.registerListener(
      "consoleLayout",
      SpiritModel.CallbackEvent.XP_UPDATE,
      this.onXPUpdate
    );
    this.spiritModel.registerListener(
      "consoleLayout",
      SpiritModel.CallbackEvent.RESET_FLAME,
      this.onActiveFlameUpdate
    );
    this.spiritModel.registerListener(
      "consoleLayout",
      SpiritModel.CallbackEvent.DIRTY_FLAME_UPDATE,
      this.onActiveFlameUpdate
    );


  }

  componentDidMount = () => {
    console.log("ConsoleLayout : componentDidMount");

    this.modelCoordinator = new ModelCoordinator();
    this.modelCoordinator.wireModelsTogether();

    if (this.teamModel.isNeverLoaded()) {
      this.teamModel.refreshAll();
    }

    if (this.activeCircleModel.isNeverLoaded()) {
      this.activeCircleModel.loadActiveCircle();
    }

    if (this.spiritModel.isNeverLoaded()) {
      this.spiritModel.refreshXP();
    }

    setTimeout(() => {
      this.animateSidebarPanel(true);
    }, 500);
  };

  componentWillUnmount = () => {
    console.log("ConsoleLayout : componentWillUnmount");

    this.modelCoordinator.unregisterModelWirings();

    this.teamModel.unregisterAllListeners("consoleLayout");
    this.activeCircleModel.unregisterAllListeners("consoleLayout");
    this.spiritModel.unregisterAllListeners("consoleLayout");
  };

  onXPUpdate = () => {
    this.setState({
      torchieOwner: this.spiritModel.getActiveScope().torchieOwner,
      xpSummary: this.spiritModel.getActiveScope().xpSummary,
      level: this.spiritModel.getActiveScope().level,
      percentXP: this.spiritModel.getActiveScope().percentXP,
      totalXP: this.spiritModel.getActiveScope().totalXP,
      remainingToLevel: this.spiritModel.getActiveScope().remainingToLevel,
      title: this.spiritModel.getActiveScope().title
    });
  };

  onActiveFlameUpdate = () => {
    this.setState({
      flameRating: this.spiritModel.getActiveScope().activeFlameRating
    });
  };

  onTeamModelUpdateCb = () => {
    console.log("ConsoleLayout : onTeamModelUpdateCb");
    // console.log("WTF TIMER " + this.teamModel.me.wtfTimer);
    this.setState({
      me: this.teamModel.me,
      teamMembers: this.teamModel.teamMembers,
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  onActiveMemberUpdateCb = () => {
    console.log("ConsoleLayout : onActiveMemberUpdateCb");
    this.setState({
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };


  onFlameChangeCb = flameRating => {
    console.log("flame update: " + flameRating);

    this.setState({
      flameRating: flameRating
    });
  };

  /// click the flame button, which either tries to do a +1 or -1
  adjustFlameCb = flameDelta => {
    console.log("Flame change :" + flameDelta);

    let flameRating = Number(this.state.flameRating) + flameDelta;
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

    console.log(
      "Old/New Flame rating :" + this.state.flameRating + "/" + flameRating
    );
    this.setState({
      flameRating: flameRating
    });
  };

  resetCb = (event, showHideFlag) => {
    this.setState({
      consoleIsCollapsed: showHideFlag
    });

    if (Boolean(showHideFlag) === false) {
      this.teamModel.refreshAll();
    }
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
      this.teamModel.resetActiveMemberToMe();

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

  changeActiveSidePanel = activeSidePanel => {
    console.log("Changed panel! " + activeSidePanel);
    this.setState({
      activePanel: activeSidePanel
    });
  };

  getTorchieName = () => {
    let torchieName = "";
    if (this.state.activeTeamMember) {
      torchieName = this.state.activeTeamMember.shortName;
    }
    return torchieName;
  };

  /// renders the root console layout of the console view
  render() {
    const animatedPanelContent = (
      <SpiritPanel
        torchieOwner={this.getTorchieName()}
        xpSummary={this.state.xpSummary}
        level={this.state.level}
        percentXP={this.state.percentXP}
        remainingToLevel={this.state.remainingToLevel}
        totalXP={this.state.totalXP}
        title={this.state.title}
        flameRating={this.state.flameRating}
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
            onFlameChange={this.onFlameChangeCb}
            onAdjustFlame={this.adjustFlameCb}
            animationTime={this.animationTime}
          />
        </div>

        <div id="wrapper" className="consoleMenu">
          <ConsoleMenu animationTime={this.animationTime} />
        </div>
      </div>
    );
  }
}
