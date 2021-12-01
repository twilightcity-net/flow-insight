import React, { Component } from "react";
import {
  Grid,
} from "semantic-ui-react";

/**
 * this component is the metrics header for top file activity
 */
export default class FileMetricsHeader extends Component {

  /**
   * builds our metrics item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FileMetricsHeader]";
    this.state = {
    };
  }

  /**
   * renders our metrics item in our grid for the console
   * @returns {*}
   */
  render() {
    return (
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={3}>
          <div className="metricHeader">
            Box
          </div>
        </Grid.Column>
        <Grid.Column width={9}>
          <div className="metricHeader">
            Filename
          </div>
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="metricHeader">
            Duration
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
