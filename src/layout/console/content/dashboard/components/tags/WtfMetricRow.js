import React, { Component } from "react";
import {
  Divider,
  Grid,
  Label,
  Popup,
} from "semantic-ui-react";
import UtilRenderer from "../../../../../../UtilRenderer";

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

  getCircuitPopupForCell(cellContent) {
    let tags = this.props.tags.split(",");

    let popup = (
      <Popup
        trigger={cellContent}
        position="bottom left"
        content={
          <div className="dashboardPopup">
            <div className="wtfTitle">
              {UtilRenderer.getCapitalizedName(
                this.props.circuitName
              )}{" "}
            </div>
            <div className="taskTitle">
              Task: {this.props.taskName}
            </div>
            <div>{this.props.taskDescription}</div>
            <Divider />
            <div className="tagsContentBlock">
              {tags.map((s, i) => (
                <Label color="grey" size="tiny" key={i}>
                  {s}
                </Label>
              ))}
            </div>
            <Divider />
            <div>
              <span className="author">
                {this.props.username}
              </span>
              <span className="date">{this.props.day}</span>
            </div>
          </div>
        }
        flowing
        inverted
        hideOnScroll
      />
    );

    return popup;
  }

  getTaskPopupForCell(cellContent) {
    let popup = (
      <Popup
        trigger={cellContent}
        position="bottom left"
        content={
          <div className="dashboardPopup">
            <div className="taskTitle">
              Task: {this.props.taskName}
            </div>
            <div>{this.props.taskDescription}</div>
            <Divider />
            <div>
              <span className="author">
                {this.props.username}
              </span>
              <span className="date">{this.props.day}</span>
            </div>
          </div>
        }
        inverted
        hideOnScroll
      />
    );

    return popup;
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

    let troubleContent = (
      <div>
        <div className="circuitTitle">
          {this.props.circuitName}
        </div>
        <div className="chunkText">
          {this.props.wtfDescription}
        </div>
      </div>
    );

    let taskContent = (
      <div style={{ height: "100%" }}>
        <div className="chunkTitle">
          {this.props.taskName}
        </div>
      </div>
    );

    let durationContent = (
      <div className="chunkText metricRight">
        {this.props.duration}
      </div>
    );

    return (
      <Grid.Row
        id={this.props.id + "-row"}
        className={"wtfrow metricRow" + extraActiveClass}
        onClick={() => this.props.onRowClick(this.props.id)}
        onMouseOver={() => {
          this.props.onHover(this.props.id);
        }}
      >
        <Grid.Column width={4}>
          {this.getCircuitPopupForCell(taskContent)}
        </Grid.Column>
        <Grid.Column width={8}>
          {troubleContent}
        </Grid.Column>
        <Grid.Column width={4}>
          {durationContent}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
