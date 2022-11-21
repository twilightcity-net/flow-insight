import React, { Component } from "react";
import {Button, Segment} from "semantic-ui-react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";

/**
 * this component is the tools panel on the welcome screen
 */
export default class ToolsPanel extends Component {
  /**
   * the constructor function that is called when creating a new ToolsPanel
   * @param props - properties that are passed in from the welcome screen layout
   */
  constructor(props) {
    super(props);
    this.name = "[ToolsPanel]";
    this.state = {
      resource: props.resource,
      isLoading: false,
    };
  }

  installAToolClick = () => {

  }

  /**
   * renders the default troubleshoot component in the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="welcomeContentPanel">
        <Segment
          textAlign={"center"}
          inverted
          padded={"very"}
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.WELCOME
            ),
          }}
        >
          <div className="welcomeTitle">Your Flow Console is an extension of your IDE,
            designed to integrate seamlessly with your workflow.
            <br/> <br/>
            <br/> <br/>
          </div>

          {/*<div className="toolsLink"><a onClick={this.installAToolClick}>Install a tool...</a></div>*/}
        </Segment>
      </div>
    );
  }
}
