import React, { Component } from "react";
import { Divider, Grid, Image } from "semantic-ui-react";

/**
 * this component is the individual flow intention item for the FlowMap
 */
export default class FrictionMetricRow extends Component {
  /**
   * builds our flow intention item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionMetricRow]";
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
    } else if ( this.props.isHoverRow) {
      extraActiveClass = " hover";
    }

    return (
      <Grid.Row
        id={1}
        className={"metricRow" + extraActiveClass}
        onClick={() =>
          this.props.onRowClick(this.props.id)
        }
        onMouseEnter={() =>
          this.props.onHover(this.props.id)
        }
      >
          <Grid.Column width={3}>
            <div className="chunkTitle">{this.props.project}</div>
          </Grid.Column>
          <Grid.Column width={3}>
            <div className="chunkTitle">{this.props.box}</div>
          </Grid.Column>
          <Grid.Column width={4}>
            <div className="chunkText metricRight">{this.props.confusionTime}</div>
          </Grid.Column>
          <Grid.Column width={3}>
            <div className="chunkText metricRight">{this.props.confusionPercent}</div>
          </Grid.Column>
          <Grid.Column width={3}>
            <div className="chunkText metricRight">{this.props.feels}</div>
          </Grid.Column>
      </Grid.Row>
    );
  }
}
