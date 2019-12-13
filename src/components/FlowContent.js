import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class FlowContent extends Component {
  constructor(props) {
    super(props);
  }

  /// renders the journal items component from array in the console view
  render() {
    return (
      <div
        id="component"
        className="flowContent"
        style={{ height: this.props.height }}
      >
        <i>Sorry, no flow data to display currently.</i>
      </div>
    );
  }
}
