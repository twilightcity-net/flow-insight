import React, { Component } from "react";
import ActiveCircuit from "./components/ActiveCircuit";
import NewCircuit from "./components/NewCircuit";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import { BrowserRequestFactory } from "../../controllers/BrowserRequestFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class CircuitResource extends Component {
  /**
   * builds our resource with the given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[CircuitResource]";
    this.state = {
      resource: props.resource,
      isWTF: this.isWTF(props.resource)
    };
    this.myController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.RESOURCES_PANEL,
      this
    );
  }

  /**
   * determines if this should be a wtf session or new start session componet
   * @param resource
   * @returns {boolean}
   */
  isWTF(resource) {
    let arr = resource.uriArr;
    if (arr.length > 1) {
      if (arr[1] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length === 3) {
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
    if (this.isWTF(this.props.resource)) {
      wtfPanel = <ActiveCircuit resource={this.state.resource} />;
    } else {
      wtfPanel = <NewCircuit resource={this.state.resource} />;
    }
    return (
      <div id="component" className="circuitLayout">
        <div id="wrapper" className="activeCircuitContent">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
