import React, {Component} from "react";
import {Grid} from "semantic-ui-react";

/**
 * this component is the tag metrics table header
 */
export default class TagMetricHeader extends Component {
  /**
   * builds our tag metrics header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TagMetricHeader]";
    this.state = {};
  }


/**
   * renders our headers
   * @returns {*}
   */
  render() {
    return (
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={8}>
          <div className="chunkTitle">Tag</div>
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="chunkTitle metricRight">Confusion (hh:mm)</div>
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="chunkTitle metricRight">Occurrences</div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

