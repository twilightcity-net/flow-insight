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
    console.log(this.calculateMenuHeight());
  }

  /// performs a simple calculation for dynamic height of panel
  calculateMenuHeight() {
    let heights = {
      rootBorder: 4,
      contentMargin: 8,
      contentHeader: 47,
      bottomMenuHeight: 28
    };

    return (
      window.innerHeight -
      heights.rootBorder -
      heights.contentMargin -
      heights.contentHeader -
      heights.bottomMenuHeight
    );
  }

  /// renders the console sidebar panel of the console view
  render() {
    return (
      <div
        id="component"
        className="consoleSidebarPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity
        }}
      >
        <Segment.Group>
          <Segment inverted>Spirit</Segment>
          <Segment inverted style={{ height: this.calculateMenuHeight() }}>
            Content
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
