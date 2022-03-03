import React, { Component } from "react";
import {Grid, Image} from "semantic-ui-react";

/**
 * this component is the intentions header for the FlowMap intentions
 */
export default class FrictionMetricHeader extends Component {
  /**
   * builds our flow map intention header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionMetricHeader]";
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
          <div className="chunkTitle metricRight">% Total Time</div>
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
