import React, { Component } from "react";
import { Segment } from "semantic-ui-react";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class JournalItems extends Component {
  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[JournalHeader]";
  }

  /**
   * renders the journal items component from array in the console view
   * @returns {*} - the JSX to render for the journal header
   */
  render() {
    return (
      <div id="component" className="journalHeader">
        <Segment inverted>
          <h3>{this.props.member}'s Journal</h3>
        </Segment>
      </div>
    );
  }
}
