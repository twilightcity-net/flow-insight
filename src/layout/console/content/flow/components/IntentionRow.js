import React, {Component} from "react";
import {Divider, Grid} from "semantic-ui-react";

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
   * renders our flow intention row in our grid
   * @returns {*}
   */
  render() {

    return (
      <Grid.Row
        id={1}
        className={"intentionRow"}
        onClick={this.handleOnClickRow}
        onMouseEnter={() => this.props.onHover(this.props.offset)}
      >
        <Grid.Column width={3}>
          <div className="chunkText">{this.props.time}</div>
        </Grid.Column>
        <Grid.Column width={13}>
          <div className="chunkText">{this.props.description}</div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
