import React, { Component } from "react";
import { Segment } from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class StartCircuit extends Component {
  /**
   * the constructor function that is called when creating a new TroubleshootSession
   * @param props - properties that are passed in from the troubleshoot layout
   */
  constructor(props) {
    super(props);
    this.name = "[StartCircuit]";
    this.state = {
      resource: props.resource
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
  }

  /**
   * handler that is called when we want to create a new learning circuit
   */
  onClickForStartCircuit = () => {
    return this.myController.startCircuit();
  };

  /**
   * renders the default troubleshoot component in the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitContent">
        <Segment
          textAlign={"center"}
          className="startCircuit"
          inverted
          padded={"very"}
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          <div className="content">
            <div
              className="wtfBtn"
              onClick={this.onClickForStartCircuit}
            >
              WTF?
            </div>
            <Segment
              inverted
              size={"huge"}
              className="desc"
            >
              <b>Start A Troubleshooting Session!</b>
            </Segment>
          </div>
        </Segment>
      </div>
    );
  }
}