import React, { Component } from "react";
import { RendererEvent } from "../RendererEventManager";
import { RendererEventManagerHelper } from "../RendererEventManagerHelper";
import { Segment } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleSidebarPanel extends Component {
  constructor(props) {
    super(props);
    this.events = {
      sidebarPanel: new RendererEvent(
        RendererEventManagerHelper.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
        this,
        function(event, arg) {
          console.log(arg);
        }
      )
    };
  }

  /// renders the root console layout of the console view
  render() {
    return (
      <div id="component" className="consoleSidebarPanel">
        <Segment.Group>
          <Segment inverted>Spirit</Segment>
          <Segment inverted>Content</Segment>
        </Segment.Group>
      </div>
    );
  }
}