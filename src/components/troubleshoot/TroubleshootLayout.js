import React, {Component} from "react";
import TroubleshootOpen from "./TroubleshootOpen";
import TroubleshootStart from "./TroubleshootStart";
import {ActiveViewControllerFactory} from "../../controllers/ActiveViewControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class TroubleshootLayout extends Component {
  constructor(props) {
    super(props);
    this.name = "[TroubleshootLayout]";
    this.state = {
      isAlarmTriggered: false
    };
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.TROUBLE_PANEL,
      this
    );
    this.myController.wireTogetherModels(this);
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    let wtfPanel;
    if (!this.state.isAlarmTriggered) {
      wtfPanel = (<TroubleshootStart/>);
    }
    else {
      wtfPanel = (<TroubleshootOpen/>);
    }

    return (
      <div id="component" className="troubleshootLayout">
        <div id="wrapper" className="troubleshootContent">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
