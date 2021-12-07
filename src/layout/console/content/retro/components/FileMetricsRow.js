import React, { Component } from "react";
import { Divider, Grid, Popup } from "semantic-ui-react";

/**
 * this component is the individual metrics item for a top file entry
 */
export default class FileMetricsRow extends Component {
  /**
   * builds our metrics item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FileMetricsRow]";
    this.state = {};
  }

  /**
   * handles clicking on our metrics item. This will eventually allow for opening a chart or stats
   * related to the file.  No-op for now.
   */
  handleOnClickRow = () => {
    // this.props.onRowClick(this);
  };

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
   * renders our metrics item in our grid for the console
   * @returns {*}
   */
  render() {
    let boxCell = this.getBoxCellContent(),
      filenameCell = this.getFileNameCellContent(),
      durationCell = this.getDurationCellContent(),
      popupContent = this.getPopupContent();

    return (
      <Grid.Row
        id={1}
        className={"metricRow"}
        onClick={this.handleOnClickRow}
      >
        <Grid.Column width={3}>
          <Popup
            flowing
            trigger={boxCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
        <Grid.Column width={9}>
          <Popup
            flowing
            trigger={filenameCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <Popup
            flowing
            trigger={durationCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
      </Grid.Row>
    );
  }
}
