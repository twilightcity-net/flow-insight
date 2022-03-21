import React, {Component} from "react";
import {Grid} from "semantic-ui-react";

/**
 * this component is the wtfs for tag metrics table header
 */
export default class WtfMetricHeader extends Component {
  /**
   * builds our tag metrics header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[WtfMetricHeader]";
    this.state = {};
  }


/**
   * renders our headers
   * @returns {*}
   */
  render() {
    return (
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={12}>
          <div className="chunkTitle">Troubleshooting Session</div>
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="chunkTitle metricRight">Confusion (hh:mm)</div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
