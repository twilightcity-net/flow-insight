import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class FlowChunkHeader extends Component {
  constructor(props) {
    super(props);

    this.name = "[FlowChunkHeader]";
  }

  /// renders the journal items component from array in the console view
  render() {
    return (
      <div
        id="component"
        className="troubleshootHeader"
        style={{ height: this.props.height }}
      >
        <Segment inverted>
          <h3>{this.props.member}'s Flow</h3>
        </Segment>
      </div>
    );
  }
}
