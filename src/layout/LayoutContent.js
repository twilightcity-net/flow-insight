import React, { Component } from "react";
import JournalResource from "../resources/journal/JournalResource";
import WtfResource from "../resources/circuit/CircuitResource";
import FlowResource from "../resources/flow/FlowResource";
import { Transition } from "semantic-ui-react";
import { ActiveViewControllerFactory } from "../controllers/ActiveViewControllerFactory";
import BrowserHeader from "./content/console/browser/BrowserHeader";
import { MainPanelViewController } from "../controllers/MainPanelViewController";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class LayoutContent extends Component {
  constructor(props) {
    super(props);
    this.name = "[LayoutContent]";
    this.animationType = MainPanelViewController.Animations.DROP;
    this.animationTime = MainPanelViewController.AnimationTimes.CONSOLE_CONTENT;
    this.state = {
      resource: MainPanelViewController.Resources.NONE
    };
    this.myController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.MAIN_PANEL,
      this
    );
  }

  componentDidMount = () => {
    this.myController.configureConsoleBrowserLoadListener(
      this,
      this.onConsoleBrowserLoadEvent
    );
  };

  componentWillUnmount = () => {
    this.myController.configureConsoleBrowserRequestListener(this, null);
  };

  onConsoleBrowserLoadEvent = (event, resource) => {
    console.log(this.name + " load resource -> " + JSON.stringify(resource));
    this.setState({
      resource: resource
    });
  };

  getActiveComponent = () => {
    let component = null,
      className = "Layout",
      resource = this.state.resource;

    if (resource.uriArr) {
      resource = resource.uriArr[0];
    }
    switch (resource) {
      case MainPanelViewController.Resources.JOURNAL:
        component = <JournalResource resource={this.state.resource} />;
        className = MainPanelViewController.Resources.JOURNAL + className;
        break;
      case MainPanelViewController.Resources.CIRCUIT:
        component = <WtfResource resource={this.state.resource} />;
        className = MainPanelViewController.Resources.JOURNAL + className;
        break;
      case MainPanelViewController.Resources.FLOW:
        component = <FlowResource resource={this.state.resource} />;
        className = MainPanelViewController.Resources.FLOW + className;
        break;
      case MainPanelViewController.Resources.NONE:
        component = "";
        className = MainPanelViewController.Resources.NONE + className;
        break;

      // TODO implement a 404 like error page to display to the user
      default:
        component = <div>404 - Unknown location '{resource}'</div>;
        className = MainPanelViewController.Resources.NONE + className;
        break;
    }
    return (
      <Transition
        visible={true}
        animation={this.animationType}
        duration={this.animationTime}
        unmountOnHide
      >
        <div id="wrapper" className={className}>
          {component}
        </div>
      </Transition>
    );
  };

  getBrowserHeader = scope => {
    return <BrowserHeader scope={scope} />;
  };

  /**
   * renders the content of the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="consoleContent">
        <div id="wrapper" className="browserHeader">
          {this.getBrowserHeader(this)}
        </div>
        {this.getActiveComponent()}
      </div>
    );
  }
}
