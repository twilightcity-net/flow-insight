import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import JournalLayout from "./JournalLayout";
import TroubleshootLayout from "./TroubleshootLayout";
import FlowLayout from "./FlowLayout";
import { Transition } from "semantic-ui-react";
import {ActiveViewControllerFactory} from "../perspective/ActiveViewControllerFactory";


//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleContent extends Component {
  constructor(props) {
    super(props);
    this.isAnimating = false;
    this.animationTime = Math.floor(this.props.animationTime / 2);
    this.state = {
      activeLayout: "journal",
      journalVisible: true,
      troubleshootVisible: false,
      flowVisible: false,
      animationTypeJournal: "fly right",
      animationTypeTroubleshoot: "fly left",
      animationTypeFlow: "fly left"
    };

    this.myController = ActiveViewControllerFactory.createViewController(ActiveViewControllerFactory.Views.MAIN_PANEL_CONTENT, this);

    this.events = {
      consoleMainPanelChange: RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
        this,
        this.onConsoleMainPanelChangeCb
      )
    };
  }



  // dispatched when the console menu changes from user clicks
  onConsoleMainPanelChangeCb(event, arg) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    let newLayout = arg.new,
      oldLayout = arg.old,
      state = this.getAnimationState(oldLayout, newLayout);
    this.setState(state);
    switch (newLayout) {
      case "journal":
        this.animateContentFromState({ journalVisible: true });
        break;
      case "troubleshoot":
        this.animateContentFromState({ troubleshootVisible: true });
        break;
      case "flow":
        this.animateContentFromState({ flowVisible: true });
        break;
      default:
        break;
    }
  }

  getAnimationState(oldLayout, newLayout) {
    let state = {
      activeLayout: newLayout,
      journalVisible: false,
      troubleshootVisible: false,
      flowVisible: false
    };
    if (oldLayout === "flow") {
      state.animationTypeJournal = "fly right";
      state.animationTypeTroubleshoot = "fly right";
      state.animationTypeFlow = "fly left";
    } else if (oldLayout === "flow" && newLayout === "journal") {
      state.animationTypeJournal = "fly right";
      state.animationTypeTroubleshoot = "fly right";
      state.animationTypeFlow = "fly left";
    } else if (oldLayout === "troubleshoot" && newLayout === "journal") {
      state.animationTypeJournal = "fly right";
      state.animationTypeTroubleshoot = "fly left";
      state.animationTypeFlow = "fly right";
    } else if (oldLayout === "troubleshoot" && newLayout === "flow") {
      state.animationTypeJournal = "fly left";
      state.animationTypeTroubleshoot = "fly right";
      state.animationTypeFlow = "fly left";
    } else if (oldLayout === "journal" && newLayout === "flow") {
      state.animationTypeJournal = "fly right";
      state.animationTypeTroubleshoot = "fly right";
      state.animationTypeFlow = "fly left";
    } else if (oldLayout === "journal" && newLayout === "troubleshoot") {
      state.animationTypeJournal = "fly right";
      state.animationTypeTroubleshoot = "fly left";
      state.animationTypeFlow = "fly right";
    }
    return state;
  }

  animateContentFromState(state) {
    setTimeout(() => {
      this.setState(state);
      this.isAnimating = false;
    }, this.animationTime);
  }

  onFlameChangeCB = flameRating => {
    if (!flameRating) {
      flameRating = 0;
    }

    this.props.onFlameChange(flameRating);
  };

  /// renders the content of the console view
  render() {
    const journalLayout = (
      <div id="wrapper" className="journalLayout">
        <JournalLayout consoleIsCollapsed={this.props.consoleIsCollapsed} />
      </div>
    );
    const troubleshootLayout = (
      <div id="wrapper" className="troubleshootLayout">
        <TroubleshootLayout
        />
      </div>
    );
    const flowLayout = (
      <div id="wrapper" className="flowLayout">
        <FlowLayout />
      </div>
    );
    return (
      <div id="component" className="consoleContent">
        <Transition
          visible={this.state.journalVisible}
          animation={this.state.animationTypeJournal}
          duration={this.animationTime}
          unmountOnHide
        >
          {journalLayout}
        </Transition>
        <Transition
          visible={this.state.troubleshootVisible}
          animation={this.state.animationTypeTroubleshoot}
          duration={this.animationTime}
          unmountOnHide
        >
          {troubleshootLayout}
        </Transition>
        <Transition
          visible={this.state.flowVisible}
          animation={this.state.animationTypeFlow}
          duration={this.animationTime}
          unmountOnHide
        >
          {flowLayout}
        </Transition>
      </div>
    );
  }
}
