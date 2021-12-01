import React, { Component } from "react";
import {
  Grid,
} from "semantic-ui-react";

/**
 * this component is the metrics header for top exec activity
 */
export default class FileMetricsHeader extends Component {

  /**
   * builds our metrics item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ExecMetricsHeader]";
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
        <Grid.Column width={8}>
          <div className="metricHeader">
            Process
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="metricHeader">
            TotalTime
          </div>
        </Grid.Column>
        <Grid.Column width={2}>
          <div className="metricHeader">
            Red
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="metricHeader">
            Green
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
