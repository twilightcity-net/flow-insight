import React, { Component } from "react";
import { Grid, Image } from "semantic-ui-react";

/**
 * this component is the metrics table header for momentum boxes
 */
export default class MomentumMetricHeader extends Component {
  /**
   * builds our friction box header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[MomentumMetricHeader]";
    this.state = {};
  }

  static WEEKS = "WEEKS";
  static DAYS = "DAYS";

  /**
   * renders our headers
   * @returns {*}
   */
  render() {
    let imgWtfSrc = "./assets/images/wtf/16x16.png";

    let timeHeader = "Day";

    if (
      this.props.bucketSize === MomentumMetricHeader.WEEKS
    ) {
      timeHeader = "Week";
    }

    return (
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={4}>
          <div className="chunkTitle">{timeHeader}</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">
            WorkHours
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">
            Confusion
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">
            Momentum
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">
            Feels (
            <Image src={imgWtfSrc} verticalAlign="middle" />
            )
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
