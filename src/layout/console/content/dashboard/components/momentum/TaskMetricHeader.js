import React, {Component} from "react";
import {Grid, Image} from "semantic-ui-react";

/**
 * this component is the metrics table header for friction-y boxes
 */
export default class TaskMetricHeader extends Component {
  /**
   * builds our friction box header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TaskMetricHeader]";
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

    if (this.props.bucketSize === TaskMetricHeader.WEEKS) {
      timeHeader = "Week";
    }

    return (
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={7}>
          <div className="chunkTitle">Task</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">Hours</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">Confusion</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">Momentum</div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
