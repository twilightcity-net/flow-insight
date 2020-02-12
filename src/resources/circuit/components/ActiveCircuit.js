import React, { Component } from "react";
import { Button, Divider, Grid, Icon, Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import { RendererControllerFactory } from "../../../controllers/RendererControllerFactory";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";
import CircuitSidebar from "./CircuitSidebar";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveCircuit extends Component {
  /**
   * the constructor, duh
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
   * gets the realtime content feed of the troubleshooting panel
   * @returns {*}
   */
  getCircuitFeed() {
    return (
      <div id="component" className="activeCircuitFeed">
        <Segment
          className="feed"
          inverted
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          Active Circuit Feed
        </Segment>
      </div>
    );
  }

  getCircuitContentPanel() {
    return (
      <div id="component" className="activeCircuitContent">
        <Segment
          className="content"
          inverted
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          Active Circuit Content
        </Segment>
      </div>
    );
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
            <Segment inverted>Content</Segment>
          </div>
          {/*<SplitterLayout*/}
          {/*  id="component"*/}
          {/*  customClassName="circuitContentPanel"*/}
          {/*  percentage={true}*/}
          {/*  primaryIndex={0}*/}
          {/*  primaryMinSize={25}*/}
          {/*  secondaryMinSize={25}*/}
          {/*  secondaryInitialSize={25}*/}
          {/*>*/}
          {/*  <div>*/}
          {/*    <div id="wrapper" className="circuitFeed">*/}
          {/*      {this.getCircuitFeed()}*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <div>*/}
          {/*    <div id="wrapper" className="circuitContentPanel">*/}
          {/*      {this.getCircuitContentPanel()}*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</SplitterLayout>*/}
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
