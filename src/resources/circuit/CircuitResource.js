import React, { Component } from "react";
import CircuitWTFOpen from "./components/CircuitWTFOpen";
import CircuitWTFStart from "./components/CircuitWTFStart";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import { MainPanelViewController } from "../../controllers/MainPanelViewController";
import { BrowserRequestFactory } from "../../controllers/BrowserRequestFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class CircuitResource extends Component {
  constructor(props) {
    super(props);
    this.name = "[CircuitResource]";
    this.state = {
      resource: props.resource,
      isWTF: this.isWTF(props.resource)
    };
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.TROUBLE_PANEL,
      this
    );
    this.myController.wireTogetherModels(this);
  }

  componentDidMount = () => {
    console.log(this.state);
  };

  isWTF(resource) {
    let arr = resource.uriArr;
    if (arr.length > 1) {
      if (arr[1] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 2 && arr.length < 4) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    let wtfPanel;

    if (this.state.isWTF) {
      wtfPanel = <CircuitWTFOpen />;
    } else {
      wtfPanel = <CircuitWTFStart />;
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
