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
      resource: props.resource,
      isLoading: false
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
    if (this.state.isLoading) {
      return;
    }
    this.setState({
      isLoading: true
    });
    return this.myController.startCircuit();
  };

  /**
   * renders our button content for our wtf button
   * @returns {*}
   */
  getButtonContent() {
    let buttonText = "?!";
    if (this.state.isLoading) {
      buttonText = ":]";
    }
    return (
      <div
        className="wtfBtn noselect"
        onClick={this.onClickForStartCircuit}
      >
        {buttonText}
      </div>
    );
  }

  getDescriptionContent() {
    let descriptionText =
      "Start A Troubleshooting Session!";
    if (this.state.isLoading) {
      descriptionText = "Thank you. Please wait...";
    }
    return (
      <Segment inverted size={"huge"} className="desc">
        <b>{descriptionText}</b>
        <br />
      </Segment>
    );
  }

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
            {this.getButtonContent()}
            {this.getDescriptionContent()}
          </div>
        </Segment>
      </div>
    );
  }
}
