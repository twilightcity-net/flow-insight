import React, { Component } from "react";
import { Button, Segment } from "semantic-ui-react";
import { DimensionController } from "../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import { ActiveViewControllerFactory } from "../../../controllers/ActiveViewControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class CircuitWTFOpen extends Component {
  /**
   * the constructor, duh
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[CircuitWTFOpen]";
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.TROUBLE_PANEL,
      this
    );
  }

  /**
   * callled when the solved button is clicked
   */
  onClickStopTroubleshoot = () => {
    console.log(this.name + " - on click stop troubleshooting");
    this.myController.stopTroubleshooting();
  };

  /**
   * gets the realtime content feed of the troubleshooting panel
   * @returns {*}
   */
  getTroubleshootFeed() {
    return (
      <div id="component" className="troubleshootFeed">
        <Segment
          className="troubleshootFeed"
          inverted
          style={{
            height: DimensionController.getHeightFor(
              DimensionController.Components.TROUBLESHOOT
            )
          }}
        >
          Troubleshoot Content Troubleshoot Open
        </Segment>
      </div>
    );
  }

  /**
   * gets the sidebar react component for the content panel of troubleshoot
   * @returns {*}
   */
  getTroubleshootSidebar() {
    return (
      <div id="component" className="troubleshootSidebar">
        <Segment className="troubleshootSidebar" inverted>
          <Segment inverted>Troubleshoot Content</Segment>
          room: angry_teachers
          <br />
          owner: zoe
          <br />
          time: 00:00:00 <br />
          <Button
            onClick={this.onClickStopTroubleshoot}
            size="big"
            color="purple"
            animated="fade"
          >
            <Button.Content visible>YAY!</Button.Content>
            <Button.Content hidden>WTF Resolved!</Button.Content>
          </Button>
        </Segment>
      </div>
    );
  }

  /**
   * renders the default troubleshoot component in the console view
   */
  render() {
    return (
      <div id="component" className="troubleshootContent">
        <SplitterLayout
          percentage={true}
          primaryIndex={0}
          primaryMinSize={25}
          secondaryMinSize={25}
          secondaryInitialSize={40}
        >
          <div>
            <div id="wrapper" className="troubleshootFeed">
              {this.getTroubleshootFeed()}
            </div>
          </div>
          <div>
            <div id="wrapper" className="troubleshootSidebar">
              {this.getTroubleshootSidebar()}
            </div>
          </div>
        </SplitterLayout>
      </div>
    );
  }
}
