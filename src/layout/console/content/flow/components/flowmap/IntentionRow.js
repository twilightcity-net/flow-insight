import React, { Component } from "react";
import { Divider, Grid, Image } from "semantic-ui-react";
import ChartView from "../../../../../../views/ChartView";

/**
 * this component is the individual flow intention item for the FlowMap
 */
export default class IntentionRow extends Component {
  /**
   * builds our flow intention item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[IntentionRow]";
    this.state = {};
  }

  /**
   * handles clicking on our flow intention item. This should update the cursor position in the flow map
   */

  /**
   * renders our box cell in the grid.
   * @returns {*}
   */
  getBoxCellContent() {
    return (
      <div className="chunkTitle">{this.props.box}</div>
    );
  }

  /**
   * renders our filename cell in the grid.
   * @returns {*}
   */
  getFileNameCellContent() {
    let fileName = this.props.filePath;

    if (fileName != null && fileName.includes("/")) {
      fileName = fileName.substr(
        this.props.filePath.lastIndexOf("/") + 1
      );
    }

    return <div className="chunkTitle">{fileName}</div>;
  }

  /**
   * renders our duration cell in our grid
   * @returns {*}
   */
  getDurationCellContent() {
    return (
      <div className="chunkText">{this.props.duration}</div>
    );
  }

  /**
   * renders our gui for the popup information.
   * @returns {*}
   */
  getPopupContent() {
    let fileName = this.props.filePath;

    if (fileName != null && fileName.includes("/")) {
      fileName = fileName.substr(
        this.props.filePath.lastIndexOf("/") + 1
      );
    }

    return (
      <div>
        <div>
          <b>
            <span className="tipHighlight">
              {" "}
              {fileName}{" "}
            </span>
          </b>
          <Divider />
        </div>
        <div>{this.props.filePath}</div>
      </div>
    );
  }

  /**
   * renders our flame rating content block.
   * This is a whole number between -5 and 5 for display
   * @returns {*}
   */
  getFlameBlockContent(flameRating) {
    let imgYaySrc = "./assets/images/yay/16x16.png",
      imgWtfSrc = "./assets/images/wtf/16x16.png";

    if (flameRating && flameRating > 0) {
      return (
        <span className="yayFlame">
          {flameRating}{" "}
          <Image src={imgYaySrc} verticalAlign="top" />
        </span>
      );
    } else if (flameRating && flameRating < 0) {
      return (
        <span className="wtfFlame">
          {Math.abs(flameRating)}{" "}
          <Image src={imgWtfSrc} verticalAlign="middle" />
        </span>
      );
    }
  }

  /**
   * renders our flow intention row in our grid
   * @returns {*}
   */
  render() {
    let extraActiveClass = "";
    if (this.props.isActiveRow) {
      extraActiveClass = " active";
    }

    let time = this.props.time;

    if (this.props.chartType === ChartView.ChartType.DAY_CHART) {
      time = this.props.eventDate;
    }

    let taskColumn = "";
    let intentionColumn = "";

    if (this.props.task) {
      taskColumn = (<Grid.Column width={3}>
        <div className="chunkText">
          {this.props.task}
        </div>
      </Grid.Column>);
      intentionColumn = (<Grid.Column width={10}>
        <div className="chunkText">
          {this.props.description}
        </div>
      </Grid.Column>);
    } else {
      intentionColumn = (<Grid.Column width={13}>
        <div className="chunkText">
          {this.props.description}
        </div>
      </Grid.Column>);
    }

    return (
      <Grid.Row
        id={1}
        className={"intentionRow" + extraActiveClass}
        onClick={() =>
          this.props.onRowClick(this.props.offset)
        }
        onMouseEnter={() =>
          this.props.onHover(this.props.offset)
        }
      >
        <Grid.Column width={2}>
          <div className="chunkText">{time}</div>
        </Grid.Column>
        {taskColumn}
        {intentionColumn}
        <Grid.Column width={1}>
          <div className="chunkText">
            {this.getFlameBlockContent(
              this.props.flameRating
            )}
          </div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
