import React, {Component} from "react";
import {List, Menu, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import RiskAreaListItem from "./RiskAreaListItem";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";
import ScopeSelectionDropdown from "./ScopeSelectionDropdown";

/**
 * this component is the left side panel wrapper for the dashboard content
 */
export default class DashboardPanel extends Component {
  /**
   * the graphical name of this component in the DOM
   * @type {string}
   */
  static className = "dashboardContent";

  /**
   * Enumeration of the different available risk area page items
   * @returns {{CODEBASE: string}}
   * @constructor
   */
  static get RiskAreaPage() {
    return {
      CODEBASE : "codebase"
    }
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
        activeItem:
          SidePanelViewController.SubmenuSelection.DASHBOARD,
        dashboardVisible: false,
        animationType:
          SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay:
          SidePanelViewController.AnimationDelays.SUBMENU,
        title: "",
        dashboardTargetType: ScopeSelectionDropdown.TargetType.USER,
        dashboardTarget: ScopeSelectionDropdown.Target.ME,
        dashboardTimeScope: ScopeSelectionDropdown.TimeScope.ALL
      };
    }
    return state;
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
  };

  /**
   * detach any listeners when we remove this from view
   */
  componentWillUnmount = () => {
    this.myController.configureDashboardPanelListener(
      this,
      null
    );
  };

  /**
   * called when refreshing the view which is triggered by any perspective
   * change by an event or menu
   */
  onRefreshDashboardPanel() {
    switch (
      this.myController.activeDashboardSubmenuSelection
    ) {
      case SidePanelViewController.SubmenuSelection.DASHBOARD:
        this.showDashboardPanel();
        break;
      default:
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
        SidePanelViewController.SubmenuSelection
          .DASHBOARD,
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
    if (page === DashboardPanel.RiskAreaPage.CODEBASE) {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.DASHBOARD,
        DashboardPanel.RiskAreaPage.CODEBASE,
        this.state.dashboardTargetType,
        this.state.dashboardTarget,
        this.state.dashboardTimeScope
      );
      this.myController.makeSidebarBrowserRequest(request);

    } else {
      console.error("Unknown risk area page, unable to load");
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
          onChangeTarget={this.onChangeTarget}
          onChangeTimeScope={this.onChangeTimeScope}/>
        <hr/>
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          <RiskAreaListItem
            id={DashboardPanel.RiskAreaPage.CODEBASE}
            title={"Codebase"}
            description={"Top confusion by area of code"}
            onItemClick={this.handleRiskAreaClick}
          />
        </List>

      </div>
    );
  };

  onChangeTarget = (target, targetType) => {
    this.setState({
      dashboardTarget : target,
      dashboardTargetType: targetType
    });
  }


  onChangeTimeScope = (timeScope) => {
    this.setState({
      dashboardTimeScope : timeScope
    });
  }

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
