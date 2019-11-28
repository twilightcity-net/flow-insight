import React, { Component } from "react";
import ConsoleSidebar from "./ConsoleSidebar";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";
import TeamPanel from "./TeamPanel";
import SpiritPanel from "./SpiritPanel";
import { DataModelFactory } from "../models/DataModelFactory";
import { SpiritModel } from "../models/SpiritModel";
import { ActiveCircleModel } from "../models/ActiveCircleModel";
import { TeamModel } from "../models/TeamModel";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";
import { SidePanelViewController } from "../perspective/SidePanelViewController";
// import { ModelCoordinator } from "../models/ModelCoordinator";
// import { PerspectiveController } from "../perspective/PerspectiveController";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleLayout extends Component {
  constructor(props) {
    super(props);
    this.name = "[ConsoleLayout]";
    this.state = {
      sidebarPanelVisible: false,
      sidebarPanelWidth: 0,
      sidebarPanelOpacity: 0,
      xpSummary: {},
      totalXP: 0,
      flameRating: 0,
      activePanel: SidePanelViewController.MenuSelection.PROFILE,
      consoleIsCollapsed: 0,
      me: { shortName: "Me", id: "id" },
      teamMembers: [],
      activeTeamMember: { shortName: "Me", id: "id" },
      isMe: true
    };
    this.animationTime = 700;

    this.sidePanelController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL,
      this
    );

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );
    this.teamModel.registerListener(
      "consoleLayout",
      TeamModel.CallbackEvent.MEMBERS_UPDATE,
      this.onTeamModelUpdateCb
    );
    this.teamModel.registerListener(
      "consoleLayout",
      TeamModel.CallbackEvent.ACTIVE_MEMBER_UPDATE,
      this.onActiveMemberUpdateCb
    );

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
    this.activeCircleModel.registerListener(
      "consoleLayout",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
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
    console.log(this.name + " - componentDidMount");

    /// FIXME :: move this to a global render event for init
    // ModelCoordinator.init(this);
    // PerspectiveController.init(this);

    this.sidePanelController.configureContentListener(
      this,
      this.onRefreshActivePerspective
    );
    this.onRefreshActivePerspective();
  };

  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.teamModel.unregisterAllListeners("consoleLayout");
    this.activeCircleModel.unregisterAllListeners("consoleLayout");
    this.spiritModel.unregisterAllListeners("consoleLayout");

    this.sidePanelController.configureContentListener(this, null);
  };

  onXPUpdate = () => {
    this.setState({
      torchieOwner: this.spiritModel.getActiveScope().torchieOwner,
      spiritId: this.spiritModel.getActiveScope().spiritId,
      xpSummary: this.spiritModel.getActiveScope().xpSummary,
      activeSpiritLinks: this.spiritModel.getActiveScope().activeSpiritLinks,
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
    console.log(this.name + " - onTeamModelUpdateCb");
    // console.log("WTF TIMER " + this.teamModel.me.wtfTimer);
    this.setState({
      isMe: this.teamModel.isMeActive(),
      me: this.teamModel.me,
      teamMembers: this.teamModel.teamMembers,
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  onActiveMemberUpdateCb = () => {
    console.log(this.name + " - onActiveMemberUpdateCb");
    this.setState({
      isMe: this.teamModel.isMeActive(),
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  onFlameChangeCb = flameRating => {
    console.log(this.name + " - onFlameChangeCb: " + flameRating);

    this.setState({
      flameRating: flameRating
    });
  };

  /// click the flame button, which either tries to do a +1 or -1
  adjustFlameCb = flameDelta => {
    console.log(this.name + " - Flame change: " + flameDelta);

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
      this.name +
        " - adjustFlameCb, Old/New Flame rating: " +
        this.state.flameRating +
        "/" +
        flameRating
    );
    this.setState({
      flameRating: flameRating
    });
  };

  onRefreshActivePerspective() {
    console.log(
      this.name +
        " - onRefreshActivePerspective: " +
        this.sidePanelController.show
    );
    let show = this.sidePanelController.show;
    if (show) {
      this.setState({
        sidebarPanelVisible: true,
        activePanel: this.sidePanelController.activeMenuSelection
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
          sidebarPanelVisible: false,
          activePanel: this.sidePanelController.activeMenuSelection
        });
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

  getTorchieName = () => {
    let torchieName = "Member";
    if (this.state.activeTeamMember) {
      torchieName = this.state.activeTeamMember.shortName;
    }
    return torchieName;
  };

  /// renders the root console layout of the console view
  render() {
    const animatedPanelContent = (
      <SpiritPanel
        me={this.state.me}
        isMe={this.state.isMe}
        torchieOwner={this.getTorchieName()}
        spiritId={this.state.spiritId}
        xpSummary={this.state.xpSummary}
        activeSpiritLinks={this.state.activeSpiritLinks}
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
      />
    );

    let activePanel = null;

    if (
      this.state.activePanel === SidePanelViewController.MenuSelection.PROFILE
    ) {
      activePanel = animatedPanelContent;
    } else if (
      this.state.activePanel === SidePanelViewController.MenuSelection.MESSAGES
    ) {
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
          <ConsoleSidebar />
        </div>
        {this.state.sidebarPanelVisible && sidebarPanel}
        <div id="wrapper" className="consoleContent">
          <ConsoleContent
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
