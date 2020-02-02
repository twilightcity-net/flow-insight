import React, { Component } from "react";
import JournalLayout from "../journal/JournalLayout";
import TroubleshootLayout from "../troubleshoot/TroubleshootLayout";
import FlowLayout from "../flow/FlowLayout";
import { Transition } from "semantic-ui-react";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import BrowserHeader from "../browser/BrowserHeader";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
    this.name = "[ConsoleContent]";
    this.isAnimating = false;
    this.animationTime = Math.floor(this.props.animationTime / 2);
    this.state = {
      activeLayout: "journal",
      journalVisible: true,
      troubleshootVisible: false,
      flowVisible: false,
      animationTypeJournal: "drop",
      animationTypeTroubleshoot: "drop",
      animationTypeFlow: "drop"
    };
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.MAIN_PANEL,
      this
    );
  }

  componentDidMount = () => {
    // this.myController.configureContentListener(
    //   this,
    //   this.onRefreshActivePerspective
    // );
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

    // TODO figure out which resource to load based on what is passed in here
  };

  /**
   * dispatched when the console menu changes from user clicks
   */
  // onRefreshActivePerspective = () => {
  //   if (this.isAnimating) return;
  //   this.isAnimating = true;
  //   let newLayout = this.myController.activeMenuSelection,
  //     oldLayout = this.myController.oldMenuSelection,
  //     state = this.getAnimationState(oldLayout, newLayout);
  //   this.setState(state);
  //   switch (newLayout) {
  //     case MainPanelViewController.MenuSelection.JOURNAL:
  //       state.journalVisible = true;
  //       this.animateContentFromState(state);
  //       break;
  //     case MainPanelViewController.MenuSelection.TROUBLESHOOT:
  //       state.troubleshootVisible = true;
  //       this.animateContentFromState(state);
  //       break;
  //     case MainPanelViewController.MenuSelection.FLOW:
  //       state.flowVisible = true;
  //       this.animateContentFromState(state);
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // getAnimationState(oldLayout, newLayout) {
  //   return {
  //     activeLayout: newLayout,
  //     journalVisible: false,
  //     troubleshootVisible: false,
  //     flowVisible: false
  //   };
  // }

  // animateContentFromState(state) {
  //   setTimeout(() => {
  //     this.setState(state);
  //     this.isAnimating = false;
  //   }, this.animationTime);
  // }

  getBrowserHeader = scope => {
    return <BrowserHeader scope={scope} />;
  };

  getJournalLayoutContent = () => {
    return (
      <div id="wrapper" className="journalLayout">
        <JournalLayout />
      </div>
    );
  };

  getTroubleshootLayoutContent = () => {
    return (
      <div id="wrapper" className="troubleshootLayout">
        <TroubleshootLayout />
      </div>
    );
  };

  getFlowLayoutContent = () => {
    return (
      <div id="wrapper" className="flowLayout">
        <FlowLayout />
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
        <Transition
          visible={this.state.journalVisible}
          animation={this.state.animationTypeJournal}
          duration={this.animationTime}
          unmountOnHide
        >
          {this.getJournalLayoutContent()}
        </Transition>
        <Transition
          visible={this.state.troubleshootVisible}
          animation={this.state.animationTypeTroubleshoot}
          duration={this.animationTime}
          unmountOnHide
        >
          {this.getTroubleshootLayoutContent()}
        </Transition>
        <Transition
          visible={this.state.flowVisible}
          animation={this.state.animationTypeFlow}
          duration={this.animationTime}
          unmountOnHide
        >
          {this.getFlowLayoutContent()}
        </Transition>
      </div>
    );
  }
}
