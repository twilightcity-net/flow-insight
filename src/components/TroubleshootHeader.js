import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class TroubleshootHeader extends Component {
  /**
   * the constructor function that builds the component
   * @param props - the properties of the component
   */
  constructor(props) {
    super(props);
    this.name = "[TroubleshootHeader]";
  }

  /**
   * renders the journal items component from array in the console view
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div id="component" className="troubleshootHeader">
        <Segment inverted>
          <h3>{this.props.member}'s Journal</h3>
        </Segment>
      </div>
    );
  }
}
