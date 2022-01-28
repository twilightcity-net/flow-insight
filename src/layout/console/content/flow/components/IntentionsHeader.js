import React, {Component} from "react";
import {Grid} from "semantic-ui-react";

/**
 * this component is the intentions header for the FlowMap intentions
 */
export default class IntentionsHeader extends Component {
  /**
   * builds our flow map intention header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[IntentionsHeader]";
    this.state = {};
  }

  /**
   * renders our headers
   * @returns {*}
   */
  render() {
    return (
      <Grid.Row className="intentionHeaderRow">
        <Grid.Column width={3}>
          <div className="chunkTitle">Time (hh:mm)</div>
        </Grid.Column>
        <Grid.Column width={13}>
          <div className="chunkTitle">Intention</div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
