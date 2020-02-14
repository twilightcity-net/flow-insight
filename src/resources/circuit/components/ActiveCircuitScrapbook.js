import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

/**
 * this class renders the active circuit scrapbook component into the console
 * view window
 */
export default class ActiveCircuitScrapbook extends Component {
  /**
   * builds the active circuit scrapbook component
   * @param props
   */
  constructor(props) {
    super(props);
  }

  /**
   * renders the circuit scrapbook component
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="activeCircuitScrapbook">
        <Segment inverted>Scrapbook</Segment>
      </div>
    );
  }
}
