import React, { Component } from "react";
import ActiveCircuit from "./components/ActiveCircuit";
import StartCircuit from "./components/StartCircuit";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import { CircuitClient } from "../../../../clients/CircuitClient";

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
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
  }

  /**
   * called right before we load the circuit resource page to see
   * if we have an active circuit to redirect to
   */
  componentDidMount() {
    if (CircuitClient.activeCircuit) {
      this.requestBrowserToLoadActiveCircuit(
        CircuitClient.activeCircuit.circuitName
      );
    }
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
        if (arr.length > 2) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param circuitName
   */
  requestBrowserToLoadActiveCircuit(circuitName) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
      circuitName
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    let wtfPanel;
    if (this.isWTF(this.props.resource)) {
      wtfPanel = <ActiveCircuit resource={this.props.resource} />;
    } else if (!CircuitClient.activeCircuit) {
      wtfPanel = <StartCircuit resource={this.props.resource} />;
    }
    return (
      <div id="component" className="circuitLayout">
        <div id="wrapper" className="circuitContent">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
