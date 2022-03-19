import React, {Component} from "react";
import {Divider, Grid, Popup} from "semantic-ui-react";

/**
 * this component is the metrics table row for top wtf rows corresponding to a tag
 */
export default class WtfMetricRow extends Component {
  /**
   * builds our tag metric rows
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[WtfMetricRow]";
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

    // 0: "User   "
    // 1: "Circuit                   "
    // 2: "Coords              "
    // 3: "Day        "
    // 4: "Timer(h:m:s) "
    // 5: "Tags                                                                "
    // 6: "Description                                                            "
    // 7: "Task             "
    // 8: "TaskDescription
    //

    //user, task, circuit, timer

    //what if we did more of a card layout here?

    let popup = <Popup
      trigger={
      <div>
        <div className="circuitTitle">{this.props.circuitName}</div>
        <div className="chunkText">{this.props.wtfDescription}</div>
      </div>
      }
      position="bottom center"
      content={
        <div className="dashboardPopup">
          <div className="wtftitle">
            <b>
              {this.props.circuitName}{" "}
            </b>
          </div>
          <Divider />
          <div>
            <i>Task: {this.props.taskName}</i>
          </div>
          <div>{this.props.taskDescription}</div>
          <Divider />
          <div>
           <span className="author">
            {this.props.username}
          </span>
          <span className="date">
            {this.props.day}
          </span>

          </div>
        </div>
      }
      inverted
      hideOnScroll
    />;

    return (
      <Grid.Row
        id={this.props.id + "-row"}
        className={"wtfrow metricRow" + extraActiveClass}
        onClick={() =>
          this.props.onRowClick(this.props.id)
        }
        onMouseEnter={() =>
          this.props.onHover(this.props.id)
        }
      >
        <Grid.Column width={12}>
          {popup}
        </Grid.Column>
        <Grid.Column width={4}>
          <div className="chunkText metricRight">{this.props.duration}</div>
        </Grid.Column>
      </Grid.Row>
    );

  }
}
