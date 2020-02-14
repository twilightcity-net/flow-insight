import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

/**
 * This class is used to render the active circuit feed in the console view
 */
export default class ActiveCircuitFeed extends Component {
  /**
   * builds the active circuit chat component for the circuit feed
   * @param props
   */
  constructor(props) {
    super(props);
  }

  /**
   * renders the active circuit chat panel for the feed
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitChat">
        <Segment inverted>Chat</Segment>
      </div>
    );
  }
}
