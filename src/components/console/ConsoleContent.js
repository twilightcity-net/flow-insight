import React, { Component } from "react";
import JournalLayout from "../journal/JournalLayout";
import TroubleshootLayout from "../troubleshoot/TroubleshootLayout";
import FlowLayout from "../flow/FlowLayout";
import { Transition } from "semantic-ui-react";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import BrowserHeader from "../browser/BrowserHeader";
import { MainPanelViewController } from "../../controllers/MainPanelViewController";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
    this.name = "[ConsoleContent]";
    this.animationType = MainPanelViewController.Animations.DROP;
    this.animationTime = MainPanelViewController.AnimationTimes.CONSOLE_CONTENT;
    this.state = {
      activeComponent: MainPanelViewController.Components.NONE
    };
    this.myController = ActiveViewControllerFactory.createViewController(
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
    // this.myController.configureContentListener(this, null);
    this.myController.configureConsoleBrowserRequestListener(this, null);
  };

  onConsoleBrowserLoadEvent = (event, resource) => {
    console.log(this.name + " load resource -> " + JSON.stringify(resource));
    this.setState({
      activeComponent: resource.uriArr[0]
    });
  };

  getActiveComponent = () => {
    let component = null,
      className = "Layout";
    switch (this.state.activeComponent) {
      case MainPanelViewController.Components.JOURNAL:
        component = <JournalLayout />;
        className = MainPanelViewController.Components.JOURNAL + className;
        break;
      default:
        component = (
          <div>404 - Unknown location '{this.state.activeComponent}'</div>
        );
        className = MainPanelViewController.Components.NONE + className;
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

  getJournalLayoutComponent = () => {
    return (
      <Transition
        visible={false}
        animation={this.animationType}
        duration={this.animationTime}
        unmountOnHide
      >
        <div id="wrapper" className="journalLayout">
          <JournalLayout />
        </div>
      </Transition>
    );
  };

  getTroubleshootLayoutComponent = () => {
    return (
      <Transition
        visible={false}
        animation={this.animationType}
        duration={this.animationTime}
        unmountOnHide
      >
        <div id="wrapper" className="troubleshootLayout">
          <TroubleshootLayout />
        </div>
      </Transition>
    );
  };

  getFlowLayoutComponent = () => {
    return (
      <Transition
        visible={false}
        animation={this.animationType}
        duration={this.animationTime}
        unmountOnHide
      >
        <div id="wrapper" className="flowLayout">
          <FlowLayout />
        </div>
      </Transition>
    );
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
