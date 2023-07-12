import React, { Component } from "react";
import ConsoleSidebar from "./console/sidebar/ConsoleSidebar";
import LayoutContent from "./console/content/LayoutContent";
import CircuitsPanel from "./console/sidebar/circuits/CircuitsPanel";
import NotificationsPanel from "./console/sidebar/notifications/NotificationsPanel";
import TeamPanel from "./console/sidebar/team/TeamPanel";
import FerviePanel from "./console/sidebar/fervie/FerviePanel";
import { RendererControllerFactory } from "../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../controllers/SidePanelViewController";
import { DimensionController } from "../controllers/DimensionController";
import DashboardPanel from "./console/sidebar/dashboard/DashboardPanel";
import BuddiesPanel from "./console/sidebar/buddies/BuddiesPanel";
import FeatureToggle from "./shared/FeatureToggle";
import MePanel from "./console/sidebar/me/MePanel";
import {RendererEventFactory} from "../events/RendererEventFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class ConsoleLayout extends Component {
  static sidebarWidth = "24em";

  /**
   * the costructor for the root console layout. This calls other child layouts
   * @param props - the properties of the component to render
   */
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
      activePanel: this.getDefaultActivePanel(),
      consoleIsCollapsed: 0,
      me: {
        displayName: SidePanelViewController.ME,
        id: SidePanelViewController.ID,
      },
      teamMembers: [],
      activeTeamMember: {
        displayName: SidePanelViewController.ME,
        id: SidePanelViewController.ID,
      },
    };

    // TODO move this stuff into the controller class
    this.sidePanelController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR,
        this
      );

    this.featureToggleScreenRefreshDispatch =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .FEATURE_TOGGLE_SCREEN_REFRESH,
        this,
        this.onFeatureToggleUpdate
      );
  }

  getDefaultActivePanel() {
    console.log("[ConsoleLayout] getDefaultActivePanel FeatureToggle.isFerviePopupEnabled = "+FeatureToggle.isFerviePopupEnabled);
    if (FeatureToggle.isFerviePopupEnabled) {
      console.log("getDefaultActivePanel fervie shown");
      return SidePanelViewController.MenuSelection.FERVIE;
    } else {
      console.log("getDefaultActivePanel home shown");
      return SidePanelViewController.MenuSelection.HOME;
    }
  }

  /**
   * called right after when the component after it is finished rendering
   */
  componentDidMount = () => {
    console.log("ConsoleLayout.componentDidMount");
    this.sidePanelController.configureSidePanelContentListener(
      this,
      this.onRefreshActivePerspective
    );
    this.onRefreshActivePerspective();

    setTimeout(() => {
      //this is to workaround a timing issue with the featureToggles initializing
      //after the console initialization -- adding an event notification on the featureToggleInit
      //seemed to introduce some other init problems -- might want to revisit.. there's complexity
      //in the initialization timing
      this.onRefreshActivePerspective();
    }, 1000);
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
    this.sidePanelController.configureSidePanelContentListener(
      this,
      null
    );
  };

  /**
   * called when refreshing the active perspective window
   */
  onRefreshActivePerspective() {
    let show = this.sidePanelController.show;
    if (show) {
      this.setState({
        sidebarPanelVisible: true,
        activePanel: this.sidePanelController.activeMenuSelection,
      });
      setTimeout(() => {
        this.setState({
          sidebarPanelWidth: ConsoleLayout.sidebarWidth,
          sidebarPanelOpacity: 1,
        });
      }, 0);
    } else {
      this.setState({
        sidebarPanelWidth: 0,
        sidebarPanelOpacity: 0,
      });
      setTimeout(() => {
        this.setState({
          sidebarPanelVisible: false,
          activePanel:
            this.sidePanelController.activeMenuSelection,
        });
      }, 420);
    }
  }

  /**
   * store child component for future reloading
   * @param state - the current state of the object
   */
  saveStateSidebarPanelCb = (state) => {
    this.setState({ sidebarPanelState: state });
  };

  /**
   *  load the child components state from this state
   * @returns {*}
   */
  loadStateSidebarPanelCb = () => {
    return this.state.sidebarPanelState;
  };


  onFeatureToggleUpdate = () => {
    console.log("XXXX ConsoleLayout.onFeatureToggleUpdate - reset to default page!!");
    this.setState({
      activePanel: this.getDefaultActivePanel()
    });
  }


  /**
   * the fervie panel that gets displayed in the side panel
   * @returns {*}
   */
  getFerviePanelContent = () => {
    return (
      <FerviePanel
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
      />
    );
  };

  /**
   * the team panel that gets displayed to the user
   * @returns {*}
   */
  getHomePanelContent = () => {
    console.log("Home panel toggle: "+FeatureToggle.isIndividualModeEnabled);
    if (FeatureToggle.isIndividualModeEnabled) {
      return (
        <MePanel
          width={this.state.sidebarPanelWidth}
          opacity={this.state.sidebarPanelOpacity}
          onHomeMeClick={this.onHomeMeClick}
        />
      );
    } else {
      return (
        <TeamPanel
          width={this.state.sidebarPanelWidth}
          opacity={this.state.sidebarPanelOpacity}
        />
      );
    }
  };

  /**
   * the buddies panel that gets displayed to the user
   * @returns {*}
   */
  getBuddiesPanelContent = () => {
    return (
      <BuddiesPanel
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
      />
    );
  };


  /**
   * renders the sidebar content for circuits
   * @returns {*}
   */
  getCircuitsContent = () => {
    return (
      <CircuitsPanel
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
      />
    );
  };

  /**
   * renders the sidebar content for dashboard
   * @returns {*}
   */
  getDashboardContent = () => {
    return (
      <DashboardPanel
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
      />
    );
  };

  /**
   * renders the notifications content panel for the sidebar
   * @returns {*}
   */
  getNotificationsContent = () => {
    return (
      <NotificationsPanel
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
  };

  /**
   * gets the sidebar panel content
   * @returns {*}
   */
  getSidebarPanelContent = () => {
    return (
      <div
        id="wrapper"
        className="consoleSidebarPanel"
        style={{
          width: this.state.sidebarPanelWidth,
          height: DimensionController.getHeightFor(
            DimensionController.Components.CONSOLE_LAYOUT
          ),
        }}
      >
        {this.getActivePanelContent()}
      </div>
    );
  };

  // TODO use boolean to show content for transitions

  /**
   * gets the active panel we should display
   * @returns {*}
   */
  getActivePanelContent = () => {
    console.log("getActivePanelContent this.state.activePanel = "+this.state.activePanel);

    switch (this.state.activePanel) {
      case SidePanelViewController.MenuSelection.FERVIE:
        return this.getFerviePanelContent();
      case SidePanelViewController.MenuSelection.HOME:
        return this.getHomePanelContent();
      case SidePanelViewController.MenuSelection.BUDDIES:
        return this.getBuddiesPanelContent();
      case SidePanelViewController.MenuSelection.CIRCUITS:
        return this.getCircuitsContent();
      case SidePanelViewController.MenuSelection.DASHBOARD:
        return this.getDashboardContent();
      case SidePanelViewController.MenuSelection.NOTIFICATIONS:
        return this.getNotificationsContent();
      default:
        throw new Error(
          "Unknown active panel '" +
            this.state.activePanel +
            "'"
        );
    }
  };

  /**
   * gets the main console content component
   * @returns {*}
   */
  getConsoleContent = () => {
    return (
      <div
        id="wrapper"
        className="consoleContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.CONSOLE_LAYOUT
          ),
        }}
      >
        <LayoutContent />
      </div>
    );
  };

  /**
   * gets the sidebar to display in the console
   * @returns {*}
   */
  getConsoleSidebar = () => {
    return (
      <div id="wrapper" className="consoleSidebar">
        <ConsoleSidebar />
      </div>
    );
  };

  /**
   * renders the root console layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div id="component" className="consoleLayout">
        {this.getConsoleSidebar()}
        {this.state.sidebarPanelVisible &&
          this.getSidebarPanelContent()}
        {this.getConsoleContent()}
      </div>
    );
  }
}
