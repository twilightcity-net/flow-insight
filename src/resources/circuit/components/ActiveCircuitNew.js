import React, { Component } from "react";
import { Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import { ActiveViewControllerFactory } from "../../../controllers/ActiveViewControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class ActiveCircuitNew extends Component {
  /**
   * the constructor function that is called when creating a new TroubleshootSession
   * @param props - properties that are passed in from the troubleshoot layout
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuitNew]";
    this.state = {
      resource: props.resource
    };
    this.myController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.RESOURCE_PANEL,
      this
    );
  }

  onStartTroubleshoot = () => {
    return this.myController.startTroubleshooting();
  };

  /**
   * renders the default troubleshoot component in the console view
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="troubleshootContent">
        <Segment
          textAlign={"center"}
          className="wtf-panel-start"
          inverted
          padded={"very"}
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          <div className="wtf-start-content">
            <div
              className="wtf-button-massive"
              onClick={this.onStartTroubleshoot}
            >
              WTF?
            </div>
            <Segment inverted size={"huge"} className="wtf-button-desc">
              <b>Start A Troubleshooting Session!</b>
            </Segment>
          </div>
        </Segment>
      </div>
    );
  }
}
