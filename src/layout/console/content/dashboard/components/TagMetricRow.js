import React, {Component} from "react";
import {Grid} from "semantic-ui-react";

/**
 * this component is the metrics table row for top tag rows
 */
export default class TagMetricRow extends Component {
  /**
   * builds our tag metric rows
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TagMetricRow]";
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
    } else if ( this.props.isHoverRow) {
      extraActiveClass = " hover";
    }

    return (
      <Grid.Row
        id={this.props.id + "-row"}
        className={"metricRow" + extraActiveClass}
        onClick={() =>
          this.props.onRowClick(this.props.id)
        }
        onMouseEnter={() =>
          this.props.onHover(this.props.id)
        }
      >
          <Grid.Column width={8}>
            <div className="chunkTitle">{this.props.tag}</div>
          </Grid.Column>
          <Grid.Column width={4}>
            <div className="chunkText metricRight">{this.props.duration}</div>
          </Grid.Column>
          <Grid.Column width={4}>
            <div className="chunkText metricRight">{this.props.count}</div>
          </Grid.Column>
      </Grid.Row>
    );

  }
}
