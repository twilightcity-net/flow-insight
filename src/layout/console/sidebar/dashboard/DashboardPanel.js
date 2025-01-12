import React, { Component } from "react";
import {
  List,
  Menu,
  Segment,
  Transition,
} from "semantic-ui-react";
import { DimensionController } from "../../../../controllers/DimensionController";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import RiskAreaListItem from "./RiskAreaListItem";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import ScopeSelectionDropdown from "./ScopeSelectionDropdown";
import { TeamClient } from "../../../../clients/TeamClient";
import DashboardResource from "../../content/dashboard/DashboardResource";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import FeatureToggle from "../../../shared/FeatureToggle";

/**
 * this component is the left side panel wrapper for the dashboard content
 */
export default class DashboardPanel extends Component {
  /**
   * the graphical name of this component in the DOM
   * @type {string}
   */
  static className = "dashboardContent";

  static get TargetType() {
    return {
      USER: "user",
      TEAM: "team",
    };
  }

  static get Target() {
    return {
      ME: "me",
      TEAM: "team",
    };
  }

  static get TimeScope() {
    return {
      ALL: "all",
      LATEST_TWO: "latest.two",
      LATEST_FOUR: "latest.four",
      LATEST_SIX: "latest.six",
    };
  }

  /**
   * builds the dashboard panel for the renderer
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[DashboardPanel]";
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.CONSOLE_SIDEBAR
      );
  }

  /**
   * loads the stored state from parent or use default values
   * @returns {{animationDelay: number, title: string, animationType: string}|*}
   */
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: SidePanelViewController.SubmenuSelection.DASHBOARD,
        dashboardVisible: false,
        animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
        title: "",
        dashboardTarget:this.getDefaultTarget(),
        dashboardTimeScope: DashboardPanel.TimeScope.ALL,
        dashboardPage: null,
      };
    }
    return state;
  }

  getDefaultTarget() {
    if (FeatureToggle.isIndividualModeEnabled()) {
      return DashboardPanel.Target.ME;
    } else {
      return DashboardPanel.Target.TEAM;
    }
  }

  /**
   * stores this components state in the parents state
   * @param state
   */
  saveState(state) {
    this.props.saveStateCb(state);
  }

  /**
   * attach our listeners to this component from our controller class
   */
  componentDidMount = () => {
    this.myController.configureDashboardPanelListener(
      this,
      this.onRefreshDashboardPanel
    );
    this.onRefreshDashboardPanel();

    TeamClient.getMyHomeTeam(this, (arg) => {
      if (!arg.error) {
        this.homeTeam = arg.data;
      } else {
        //TODO raise error page
        console.error(arg.error);
      }
    });

    this.dashboardLoadListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_DASHBOARD_LOAD,
        this,
        this.onDashboardLoad
      );

    this.consoleBrowserLoadListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .WINDOW_CONSOLE_BROWSER_LOAD,
        this,
        this.onBrowserLoad
      );
  };

  /**
   * detach any listeners when we remove this from view
   */
  componentWillUnmount = () => {
    this.dashboardLoadListener.clear();
    this.consoleBrowserLoadListener.clear();
    this.myController.configureDashboardPanelListener(
      this,
      null
    );
  };

  /**
   * On a general browser page load that isn't the dashboard, clear our active state
   * @param event
   * @param resource
   */
  onBrowserLoad(event, resource) {
    if (resource.uriArr && resource.uriArr[0] !== "dashboard") {
      this.setState({
        dashboardPage: null,
        dashboardTarget: this.getDefaultTarget(),
        dashboardTimeScope: DashboardPanel.TimeScope.ALL
      });
    }
  }

  /**
   * When the dashboard content page loads, we get a callback event
   */
  onDashboardLoad(event, arg) {
    console.log("dashboard loaded!");
    if (arg) {
      const page = arg.dashboardType;
      const dashboardTarget = this.getDashboardTargetFromType(arg.targetType);
      const dashboardTimescope = this.getDashboardTimescopeFromScopeInput(arg.timeScope);

      this.setState({
        dashboardPage: page,
        dashboardTarget: dashboardTarget,
        dashboardTimeScope: dashboardTimescope
      });
    }
  }

  /**
   * Translate a target type from our dashboard load back into a target type
   * appropriate for our dropdown
   * @param targetType
   */
  getDashboardTargetFromType(targetType) {
    if (targetType === DashboardPanel.TargetType.USER) {
      return DashboardPanel.Target.ME;
    } else if (targetType === DashboardPanel.TargetType.TEAM) {
      return DashboardPanel.Target.TEAM;
    }
  }

  /**
   * Translates a dashboard load timescope into a valid selection for the panel dropdown.
   * If a timescope is manually set, we may need to adapt to choosing a default
   * because nothing will match
   * @param timeScope
   */
  getDashboardTimescopeFromScopeInput(timeScope) {
    if (timeScope === DashboardPanel.TimeScope.ALL ||
      timeScope === DashboardPanel.TimeScope.LATEST_TWO ||
      timeScope === DashboardPanel.TimeScope.LATEST_FOUR ||
      timeScope === DashboardPanel.TimeScope.LATEST_FOUR) {
      return timeScope;
    } else {
      return DashboardPanel.TimeScope.ALL;
    }
  }

  /**
   * called when refreshing the view which is triggered by any perspective
   * change by an event or menu
   */
  onRefreshDashboardPanel() {
    if (this.myController.activeDashboardSubmenuSelection
      === SidePanelViewController.SubmenuSelection.DASHBOARD) {
      this.showDashboardPanel();
    } else {
      throw new Error(
        "Unknown dashboard panel menu item"
      );
    }
  }

  /**
   * display the dashboard panel in the sidebar panel
   */
  showDashboardPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.DASHBOARD,
      dashboardVisible: true,
    });
  }

  /**
   * updates display to show dashboard content
   * @param e
   * @param name
   */
  handleDashboardClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      dashboardVisible: true,
    });
  };

  /**
   * Handle navigating the resource to the clicked item page
   * @param page
   */
  handleRiskAreaClick = (page) => {
    let targetType = this.getTargetTypeForBrowserRequest(this.state.dashboardTarget);
    let target = this.getTargetForBrowserRequest(this.state.dashboardTarget);

    this.setState({
      dashboardPage: page
    });

    this.handleDashboardReload(page, targetType, target, this.state.dashboardTimeScope);
  };

  /**
   * Reload the dashboard page with the supplied target params
   * @param page
   * @param targetType
   * @param target
   * @param timeScope
   */
  handleDashboardReload(page, targetType, target, timeScope) {

    if (page === DashboardResource.DashboardType.CODEBASE) {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.DASHBOARD,
        DashboardResource.DashboardType.CODEBASE,
        targetType,
        target,
        timeScope
      );
      this.myController.makeSidebarBrowserRequest(request);
    } else if (
      page === DashboardResource.DashboardType.FAMILIARITY
    ) {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.DASHBOARD,
        DashboardResource.DashboardType.FAMILIARITY,
        targetType,
        target,
        timeScope
      );
      this.myController.makeSidebarBrowserRequest(request);
    } else if (
      page === DashboardResource.DashboardType.MOMENTUM
    ) {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.DASHBOARD,
        DashboardResource.DashboardType.MOMENTUM,
        targetType,
        target,
        timeScope
      );
      this.myController.makeSidebarBrowserRequest(request);
    } else if (
      page === DashboardResource.DashboardType.TAGS
    ) {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.DASHBOARD,
        DashboardResource.DashboardType.TAGS,
        targetType,
        target,
        timeScope
      );
      this.myController.makeSidebarBrowserRequest(request);
    } else {
      console.error("Unknown risk area page, unable to load");
    }
  }

  onChangeTarget = (changedTarget) => {
    console.log("Change target!");

    if (this.state.dashboardPage) {
      let targetType = this.getTargetTypeForBrowserRequest(changedTarget);
      let target = this.getTargetForBrowserRequest(changedTarget);
      this.handleDashboardReload(this.state.dashboardPage, targetType, target, this.state.dashboardTimeScope);
    }

    this.setState({
      dashboardTarget: changedTarget,
    });
  };

  onChangeTimeScope = (timeScope) => {
    console.log("Change timescope!");

    if (this.state.dashboardPage) {
      let targetType = this.getTargetTypeForBrowserRequest(this.state.dashboardTarget);
      let target = this.getTargetForBrowserRequest(this.state.dashboardTarget);
      this.handleDashboardReload(this.state.dashboardPage, targetType, target, timeScope);
    }

    this.setState({
      dashboardTimeScope: timeScope,
    });
  };

  getTargetTypeForBrowserRequest(targetInput) {
    if (targetInput === DashboardPanel.Target.ME) {
      return DashboardPanel.TargetType.USER;
    } else if (targetInput === DashboardPanel.Target.TEAM) {
      return DashboardPanel.TargetType.TEAM;
    }
  }

  getTargetForBrowserRequest(targetInput) {
    if (targetInput === DashboardPanel.Target.ME) {
      return targetInput;
    } else if (targetInput === DashboardPanel.Target.TEAM) {
      if (this.homeTeam) {
        return this.homeTeam.name;
      } else {
        return "unknown";
      }
    }
  }


  /**
   * gets the badges content panel for the sidebar
   * @returns {*}
   */
  getDashboardContent = () => {
    return (
      <div className="riskAreaContent">
        <ScopeSelectionDropdown
          width={this.props.width}
          target={this.state.dashboardTarget}
          timeScope={this.state.dashboardTimeScope}
          onChangeTarget={this.onChangeTarget}
          onChangeTimeScope={this.onChangeTimeScope}
        />
        <hr />
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          <RiskAreaListItem
            id={DashboardResource.DashboardType.CODEBASE}
            title={"Codebase"}
            active={this.state.dashboardPage === DashboardResource.DashboardType.CODEBASE}
            description={"Top confusion by area of code"}
            tipInstruction={
              "Code areas with a high amount of confusion indicate a potential opportunity for refactoring and simplification"
            }
            onItemClick={this.handleRiskAreaClick}
          />
          <RiskAreaListItem
            id={DashboardResource.DashboardType.MOMENTUM}
            title={"Momentum"}
            active={this.state.dashboardPage === DashboardResource.DashboardType.MOMENTUM}
            description={"Trending momentum and friction"}
            tipInstruction={
              "Overall momentum is an indicator of a healthy codebase and knowledgeable team. Drops in momentum are an indicator of difficulties"
            }
            onItemClick={this.handleRiskAreaClick}
          />
          <RiskAreaListItem
            id={DashboardResource.DashboardType.FAMILIARITY}
            title={"Familiarity"}
            active={this.state.dashboardPage === DashboardResource.DashboardType.FAMILIARITY}
            description={"Knowledge gaps by area of code"}
            tipInstruction={
              "Expanding our knowledge of more areas of code reduces the likelihood of mistakes and confusion, and increases momentum"
            }
            onItemClick={this.handleRiskAreaClick}
          />
          <RiskAreaListItem
            id={DashboardResource.DashboardType.TAGS}
            title={"Pain Types"}
            active={this.state.dashboardPage === DashboardResource.DashboardType.TAGS}
            description={
              "Top tags from troubleshooting sessions"
            }
            tipInstruction={
              "Reoccurring patterns of difficulty may indicate the need for a strategic shift in the approach to development, software libraries, or architecture"
            }
            onItemClick={this.handleRiskAreaClick}
          />
        </List>
      </div>
    );
  };


  /**
   * renders the console sidebar dashboard panel of the console view
   * @returns {*}
   */
  render() {
    return (
      <div
        id="component"
        className="consoleSidebarPanel dashboardPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity,
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name="risk-areas"
              active={true}
              onClick={this.handleDashboardClick}
            />
          </Menu>
          <Segment
            inverted
            style={{
              height:
                DimensionController.getSidebarPanelHeight(),
            }}
          >
            <Transition
              visible={this.state.dashboardVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getDashboardContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }


}
