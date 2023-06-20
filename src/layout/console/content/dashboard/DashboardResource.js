import React, { Component } from "react";
import CodebaseChartContent from "./components/CodebaseChartContent";
import { DimensionController } from "../../../../controllers/DimensionController";
import FamiliarityChartContent from "./components/FamiliarityChartContent";
import TopTagsChartContent from "./components/TopTagsChartContent";
import MomentumChartContent from "./components/MomentumChartContent";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import {BrowserRequestFactory} from "../../../../controllers/BrowserRequestFactory";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";

/**
 * this component is the tab panel wrapper for dashboard content
 * @copyright Twilight City, Inc. 2022©®™√
 */
export default class DashboardResource extends Component {
  /**
   * builds the chart layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[DashboardResource]";
    this.state = {
      resource: props.resource,
      dashboardType: null,
      target: null,
      timeScope: null,
    };
  }

  /**
   * Enumeration of the different available dashboard page items available
   * @returns {{MOMENTUM:string, CODEBASE: string, FAMILIARITY: string, TAGS:string}}
   * @constructor
   */
  static get DashboardType() {
    return {
      CODEBASE: "codebase",
      FAMILIARITY: "familiarity",
      TAGS: "tags",
      MOMENTUM: "momentum",
    };
  }

  componentDidMount() {
    let arr = this.props.resource.uriArr;
    let selection = null;
    if (arr.length > 4) {
      selection = arr[5];
    }

    let dashboardConfig = {
      dashboardType: arr[1],
      targetType: arr[2],
      target: arr[3],
      timeScope: arr[4],
      selection: selection
    }
    this.setState(dashboardConfig);

    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES
    );

    this.dashboardLoadNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_DASHBOARD_LOAD,
        this
      );

    this.dashboardLoadNotifier.dispatch(dashboardConfig);
  }

  componentWillUnmount() {
    this.dashboardLoadNotifier.clear();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let arr = this.props.resource.uriArr;

    if (this.props.resource.uri !== prevProps.resource.uri) {

      let selection = null;
      if (arr.length > 4) {
        selection = arr[5];
      }

      let dashboardConfig = {
        dashboardType: arr[1],
        targetType: arr[2],
        target: arr[3],
        timeScope: arr[4],
        selection: selection
      };

      this.setState(dashboardConfig);

      console.log("dispatch on updated!");
      this.dashboardLoadNotifier.dispatch(dashboardConfig);
    }
  }

  returnToPreviousResource = () => {
    //TODO this is a bit of a hack, since we're assuming coming from previous resource
    // means our this week's flow resource

    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.FLOW
    );
    this.myController.makeSidebarBrowserRequest(request);
  }
  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    let height = DimensionController.getHeightFor(
      DimensionController.Components.DASHBOARD_PANEL
    );

    let contentPanel = "";
    if (this.state.dashboardType === DashboardResource.DashboardType.CODEBASE) {
      contentPanel = (
        <CodebaseChartContent
          targetType={this.state.targetType}
          target={this.state.target}
          timeScope={this.state.timeScope}
        />
      );
    } else if (this.state.dashboardType === DashboardResource.DashboardType.FAMILIARITY) {
      contentPanel = (
        <FamiliarityChartContent
          targetType={this.state.targetType}
          target={this.state.target}
          timeScope={this.state.timeScope}
        />
      );
    } else if (this.state.dashboardType === DashboardResource.DashboardType.MOMENTUM) {
      contentPanel = (
        <MomentumChartContent
          targetType={this.state.targetType}
          target={this.state.target}
          timeScope={this.state.timeScope}
          selection={this.state.selection}
          returnToPreviousResource={this.returnToPreviousResource}
        />
      );
    } else if (this.state.dashboardType === DashboardResource.DashboardType.TAGS) {
      contentPanel = (
        <TopTagsChartContent
          targetType={this.state.targetType}
          target={this.state.target}
          timeScope={this.state.timeScope}
        />
      );
    }

    return (
      <div
        id="component"
        className="dashboardLayout"
        style={{ height: height }}
      >
        <div id="wrapper" className="dashboardContent">
          {contentPanel}
        </div>
      </div>
    );
  }
}
