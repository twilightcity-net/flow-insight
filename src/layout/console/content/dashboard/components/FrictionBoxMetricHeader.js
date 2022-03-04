import React, {Component} from "react";
import {Grid, Image} from "semantic-ui-react";

/**
 * this component is the metrics table header for friction-y boxes
 */
export default class FrictionBoxMetricHeader extends Component {
  /**
   * builds our friction box header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionBoxMetricHeader]";
    this.state = {};
  }


/**
   * renders our headers
   * @returns {*}
   */
  render() {
    let imgWtfSrc = "./assets/images/wtf/16x16.png";
    return (
      <Grid.Row className="metricHeaderRow">
        <Grid.Column width={3}>
          <div className="chunkTitle">Project</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle">Box</div>
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="chunkTitle metricRight">Confusion (hh:mm)</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">Pain Density</div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkTitle metricRight">Feels
              (<Image src={imgWtfSrc} verticalAlign="middle"/>)
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
