import React, { Component } from "react";
import TroubleshootHeader from "./TroubleshootHeader";
import TroubleshootSessionNew from "./TroubleshootSessionNew";
import TroubleshootSessionOpen from "./TroubleshootSessionOpen";
import { DataModelFactory } from "../models/DataModelFactory";
import { ActiveCircleModel } from "../models/ActiveCircleModel";

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootLayout extends Component {
  constructor(props) {
    super(props);

    this.name = "[TroubleshootLayout]";

    this.state = {
      isAlarmTriggered: false
    };

    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS
    );
  }

  componentDidMount() {
    this.activeCircleModel.registerListener(
      "troubleshootLayout",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onActiveCircleUpdateCb
    );

    this.onActiveCircleUpdateCb();
  }

  componentWillUnmount() {
    this.activeCircleModel.unregisterAllListeners("troubleshootLayout");
  }

  onActiveCircleUpdateCb = () => {
    console.log(this.name + " - onActiveCircleUpdateCb");
    this.setState({
      isAlarmTriggered: this.activeCircleModel.getActiveScope().isAlarmTriggered
    });
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
    console.log(this.name + "onStartTroubleshooting");

    this.activeCircleModel.createCircle(problemStatement);
  };

  onStopTroubleshooting = () => {
    console.log(this.name + "onStopTroubleshooting");

    this.activeCircleModel.closeActiveCircle();
  };

  /// renders the journal layout of the console view
  render() {
    let wtfPanel = null,
      wtfHeader = <TroubleshootHeader member={this.teamModel.getActiveTeamMemberShortName()} />;

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
        <div id="wrapper" className="troubleshootHeaderDefault">
          {wtfHeader}
        </div>
        <div id="wrapper" className="troubleshootPanelDefault">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
