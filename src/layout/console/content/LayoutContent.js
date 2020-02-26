import React, { Component } from "react";
import JournalResource from "./journal/JournalResource";
import CircuitResource from "./circuit/CircuitResource";
import FlowResource from "./flow/FlowResource";
import { Icon, Message, Transition } from "semantic-ui-react";
import { RendererControllerFactory } from "../../../controllers/RendererControllerFactory";
import LayoutBrowser from "./LayoutBrowser";
import { MainPanelViewController } from "../../../controllers/MainPanelViewController";

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
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.LAYOUT_CONTENT,
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

  // TODO create a renderActiveComponent function for the switch below
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
        component = <CircuitResource resource={this.state.resource} />;
        className = MainPanelViewController.Resources.CIRCUIT + className;
        break;
      case MainPanelViewController.Resources.FLOW:
        component = <FlowResource resource={this.state.resource} />;
        className = MainPanelViewController.Resources.FLOW + className;
        break;
      case MainPanelViewController.Resources.NONE:
        component = "";
        className = MainPanelViewController.Resources.NONE + className;
        break;
      case MainPanelViewController.Resources.ERROR:
        component = this.getJournalError(resource);
        className = MainPanelViewController.Resources.ERROR + className;
        break;
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
    return <LayoutBrowser scope={scope} />;
  };

  /**
   * renders our error for the screen
   * @returns {*}
   */
  getJournalError = error => {
    return (
      <div id="component" className="errorLayout">
        <Message icon negative size="large">
          <Icon name="warning sign" />
          <Message.Content>
            <Message.Header>{error} :(</Message.Header>
            WTF! Something went wrong =(^.^)=
          </Message.Content>
        </Message>
      </div>
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
