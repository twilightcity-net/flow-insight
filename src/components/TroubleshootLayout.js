import React, { Component } from "react";
import TroubleshootSessionNew from "./TroubleshootSessionNew";
import TroubleshootSessionOpen from "./TroubleshootSessionOpen";
import { DataModelFactory } from "../models/DataModelFactory";
import {ActiveCircleModel} from "../models/ActiveCircleModel";

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAlarmTriggered: false
    };

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );
  }

  componentDidMount() {

    this.activeCircleModel.registerListener(
      "troubleshootLayout",
      ActiveCircleModel.CallbackEvent.CIRCLE_UPDATE,
      this.onActiveCircleUpdateCb
    );

    if (this.activeCircleModel.isNeverLoaded()) {
      this.activeCircleModel.loadActiveCircle();
    } else {
      this.onActiveCircleUpdateCb();
    }

  }

  componentWillUnmount() {
    this.activeCircleModel.unregisterAllListeners("troubleshootLayout");
  }

  onActiveCircleUpdateCb = () => {
     console.log("TroubleshootLayout: onActiveCircleUpdateCb");
     this.setState({isAlarmTriggered : this.activeCircleModel.isAlarmTriggered})
  };



  /// performs a simple calculation for dynamic height of items, this
  /// is becuase there will be a slight variation in the screen height
  calculateTroubleshootItemsHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
      journalEntry: 50
    };

    /// subtract the root element's height from total window height that is
    /// half of the clients screen height
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.journalEntry
    );
  }

  onStartTroubleshooting = problemStatement => {
    console.log("onStartTroubleshooting");

    this.activeCircleModel.createCircle(problemStatement);
  };

  onStopTroubleshooting = () => {
    console.log("onStopTroubleshooting");

    this.activeCircleModel.closeActiveCircle();
  };

  /// renders the journal layout of the console view
  render() {
    let wtfPanel = null;

    if (this.state.isAlarmTriggered) {
      wtfPanel = (
        <TroubleshootSessionOpen
          height={this.calculateTroubleshootItemsHeight()}
          onStopTroubleshooting={this.onStopTroubleshooting}
        />
      );
    } else {
      wtfPanel = (
        <TroubleshootSessionNew
          height={this.calculateTroubleshootItemsHeight()}
          onStartTroubleshooting={this.onStartTroubleshooting}
        />
      );
    }

    return (
      <div id="component" className="troubleshootLayout">
        <div id="wrapper" className="troubleshootPanelDefault">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
