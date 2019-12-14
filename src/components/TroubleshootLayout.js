import React, {Component} from "react";
import TroubleshootHeader from "./TroubleshootHeader";
import TroubleshootSessionOpen from "./TroubleshootSessionOpen";
import {DataModelFactory} from "../models/DataModelFactory";
import {ActiveCircleModel} from "../models/ActiveCircleModel";
import TroubleshootStart from "./TroubleshootStart";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class TroubleshootLayout extends Component {
  constructor(props) {
    super(props);
    this.name = "[TroubleshootLayout]";

    // TODO move this into the controller class


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

  // TODO move the model and stuff to there own controller

  onActiveCircleUpdateCb = () => {
    console.log(this.name + " - onActiveCircleUpdateCb");
    this.setState({
      isAlarmTriggered: this.activeCircleModel.getActiveScope().isAlarmTriggered
    });
  };

  // TODO move these functions to controller
  onStartTroubleshooting = () => {
    console.log(this.name + "onStartTroubleshooting");

    this.activeCircleModel.createCircle();
  };

  onStopTroubleshooting = () => {
    console.log(this.name + "onStopTroubleshooting");

    this.activeCircleModel.closeActiveCircle();
  };

  /**
   * renders the journal layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    let wtfPanel = null,
      wtfHeader = null;
    if (this.state.isAlarmTriggered) {
      wtfHeader = (
        <TroubleshootHeader
          member={this.teamModel.getActiveTeamMemberShortName()}
        />
      );
    }

    // TODO move these handlers into there own controller class

    if (!this.state.isAlarmTriggered) {
      wtfPanel = (
        <TroubleshootStart
          onStartTroubleshooting={this.onStartTroubleshooting}
        />
      );
    }
    else {
      wtfPanel = (
        <TroubleshootSessionOpen
          onStopTroubleshooting={this.onStopTroubleshooting}
        />
      );
    }

    return (
      <div id="component" className="troubleshootLayout">
        {this.state.isAlarmTriggered && (
          <div id="wrapper" className="troubleshootHeaderDefault">
            {wtfHeader}
          </div>
        )}
        <div id="wrapper" className="troubleshootPanelDefault">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
