import React, { Component } from "react";
import { Grid } from "semantic-ui-react";

/**
 * this component is the metrics table row for friction-y boxes
 */
export default class FrictionModuleMetricRow extends Component {
  /**
   * builds our friction box metric rows
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionModuleMetricRow]";
    this.state = {};
  }

  /**
   * renders our row in our grid
   * @returns {*}
   */
  render() {
    let extraActiveClass = "";
    if (this.props.isActiveRow) {
      extraActiveClass = " active";
    } else if (this.props.isHoverRow) {
      extraActiveClass = " hover";
    }

    return (
      <Grid.Row
        id={this.props.id + "-row"}
        className={"metricRow" + extraActiveClass}
        onClick={() => this.props.onRowClick(this.props.id)}
        onMouseEnter={() =>
          this.props.onHover(this.props.id)
        }
      >
        <Grid.Column width={6}>
          <div className="chunkTitle">
            {this.props.module}
          </div>
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="chunkText metricRight">
            {this.props.confusionTime}
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkText metricRight">
            {this.props.confusionPercent}%
          </div>
        </Grid.Column>
        <Grid.Column width={3}>
          <div className="chunkText metricRight">
            {this.props.feels}
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
