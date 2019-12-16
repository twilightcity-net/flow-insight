import React, { Component } from "react";
import TroubleshootHeader from "./TroubleshootHeader";
import TroubleshootOpen from "./TroubleshootOpen";
import { ActiveCircleModel } from "../../models/ActiveCircleModel";
import TroubleshootStart from "./TroubleshootStart";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";

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
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.TROUBLE_PANEL,
      this
    );
    this.myController.wireTogetherModels(this);
  }

  componentDidMount() {
    // TODO this should be moved over into the controller

    this.myController.activeCircleModel.registerListener(
      "troubleshootLayout",
      ActiveCircleModel.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      this.onActiveCircleUpdateCb
    );

    this.onActiveCircleUpdateCb();
  }

  componentWillUnmount() {
    this.myController.unregisterListeners();
  }

  onActiveCircleUpdateCb = () => {
    console.log(this.name + " - onActiveCircleUpdateCb");
    this.setState({
      isAlarmTriggered: this.myController.activeCircleModel.getActiveScope()
        .isAlarmTriggered
    });
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
          member={this.myController.teamModel.getActiveTeamMemberShortName()}
        />
      );
    }

    // TODO move these handlers into there own controller class

    if (!this.state.isAlarmTriggered) {
      wtfPanel = (
        <TroubleshootStart
          onStartTroubleshooting={this.myController.onStartTroubleshooting}
        />
      );
    } else {
      wtfPanel = (
        <TroubleshootOpen
          onStopTroubleshooting={this.myController.onStopTroubleshooting}
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
