import React, { Component } from "react";
import TerminalResource from "./terminal/TerminalResource";
import JournalResource from "./journal/JournalResource";
import CircuitResource from "./circuit/CircuitResource";
import FlowResource from "./flow/FlowResource";
import {
  Icon,
  Message,
  Transition,
} from "semantic-ui-react";
import { RendererControllerFactory } from "../../../controllers/RendererControllerFactory";
import LayoutBrowser from "./LayoutBrowser";
import { MainPanelViewController } from "../../../controllers/MainPanelViewController";
import RetroResource from "./retro/RetroResource";
import PlayResource from "./play/PlayResource";
import DashboardResource from "./dashboard/DashboardResource";
import MoovieResource from "./moovie/MoovieResource";
import ToolsResource from "./welcome/ToolsResource";

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
      resource: MainPanelViewController.Resources.NONE,
      browserVisible: true,
    };

    this.myController =
      RendererControllerFactory.getViewController(
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
    this.myController.configureConsoleBrowserLoadListener(
      this,
      null
    );
  };

  onConsoleBrowserLoadEvent = (event, resource) => {
    console.log(
      this.name +
        " load resource -> " +
        JSON.stringify(resource)
    );
    let state = {
      resource: resource,
      browserVisible: true,
    };
    if (
      resource.uriArr[0] === MainPanelViewController.Resources.TERMINAL ||
      resource.uriArr[0] === MainPanelViewController.Resources.PLAY ||
      resource.uriArr[0] === MainPanelViewController.Resources.MOOVIE ||
      resource.uriArr[0] === MainPanelViewController.Resources.FLOW
    ) {
      state.browserVisible = false;
    }
    this.setState(state);
  };

  getActiveComponent = () => {
    let component = null,
      className = "Layout",
      resource = this.state.resource;

    if (resource.uriArr) {
      resource = resource.uriArr[0];
    }
    console.log("resource: " + resource);
    switch (resource) {
      case MainPanelViewController.Resources.TERMINAL:
        component = (<TerminalResource resource={this.state.resource}/>);
        className = MainPanelViewController.Resources.TERMINAL + className;
        break;
      case MainPanelViewController.Resources.JOURNAL:
        component = (<JournalResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.JOURNAL + className;
        break;
      case MainPanelViewController.Resources.WTF:
        component = (<CircuitResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.CIRCUIT + className;
        break;
      case MainPanelViewController.Resources.RETRO:
        component = (<RetroResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.RETRO + className;
        break;
      case MainPanelViewController.Resources.FLOW:
        component = (<FlowResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.FLOW + className;
        break;
      case MainPanelViewController.Resources.DASHBOARD:
        component = (<DashboardResource resource={this.state.resource}/>);
        className = MainPanelViewController.Resources.DASHBOARD + className;
        break;
      case MainPanelViewController.Resources.PLAY:
        component = (<PlayResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.PLAY + className;
        break;
      case MainPanelViewController.Resources.MOOVIE:
        component = (<MoovieResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.MOOVIE + className;
        break;
      case MainPanelViewController.Resources.TOOLS:
        component = (<ToolsResource resource={this.state.resource} />);
        className = MainPanelViewController.Resources.TOOLS + className;
        break;
      case MainPanelViewController.Resources.NONE:
        component = "";
        className = MainPanelViewController.Resources.NONE + className;
        break;
      case MainPanelViewController.Resources.ERROR:
        component = this.getErrorPage(resource);
        className = MainPanelViewController.Resources.ERROR + className;
        break;
      default:
        component = this.getErrorPage(resource);
        className = MainPanelViewController.Resources.ERROR + className;
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

  getBrowserHeader = (scope) => {
    let resource = this.state.resource;
    if (resource.uriArr) {
      resource = resource.uriArr[0];
    }
    return (
      <LayoutBrowser scope={scope} resource={resource} />
    );
  };

  /**
   * renders our error for the screen
   * @returns {*}
   */
  getErrorPage = (error) => {
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
        <Transition
          visible={this.state.browserVisible}
          animation="slide down"
          duration={420}
        >
          <div id="wrapper" className="browserHeader">
            {this.getBrowserHeader(this)}
          </div>
        </Transition>
        {this.getActiveComponent()}
      </div>
    );
  }
}
