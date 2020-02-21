import React, { Component } from "react";
import { DimensionController } from "../../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import CircuitSidebar from "./CircuitSidebar";
import ActiveCircuitFeed from "./ActiveCircuitFeed";
import ActiveCircuitScrapbook from "./ActiveCircuitScrapbook";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveCircuit extends Component {
  /**
   *  builds the active circuit component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuit]";
    this.myController = props.myController;
    this.state = {
      resource: props.resource
    };
  }

  /**
   * make sure we load the circuit with members when we load this component
   */
  componentDidMount() {
    console.log(this.name + " load active circuit with members");

    // TODO implement circuit client getActiveCircuitWithMembers()
  }

  /**
   * renders the default troubleshoot component in the console view
   */
  render() {
    return (
      <div
        id="component"
        className="circuitContent"
        style={{ height: DimensionController.getActiveCircuitContentHeight() }}
      >
        <div id="wrapper" className="circuitContentPanel">
          <div id="component" className="circuitContentPanel">
            <SplitterLayout
              customClassName="content"
              primaryMinSize={DimensionController.getActiveCircuitContentFeedMinWidth()}
              secondaryMinSize={DimensionController.getActiveCircuitContentScrapbookMinWidth()}
              secondaryInitialSize={DimensionController.getActiveCircuitContentScrapbookMinWidthDefault()}
            >
              <div id="wrapper" className="activeCircuitFeed">
                <ActiveCircuitFeed />
              </div>
              <div id="wrapper" className="activeCircuitScrapbook">
                <ActiveCircuitScrapbook />
              </div>
            </SplitterLayout>
          </div>
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          <div id="component" className="circuitContentSidebar">
            <CircuitSidebar
              controller={this.myController}
              resource={this.state.resource}
            />
          </div>
        </div>
      </div>
    );
  }
}
