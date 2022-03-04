import React, {Component} from "react";
import {Divider, Grid, Popup} from "semantic-ui-react";

/**
 * this component is the metrics table row for friction-y boxes
 */
export default class FrictionFileMetricRow extends Component {
  /**
   * builds our friction box metric rows
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionBoxMetricRow]";
    this.state = {};
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
   * renders our file row in the grid
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
          <Grid.Column width={6}>
            <Popup
              flowing
              trigger={this.getFileNameCellContent()}
              className="metricContent"
              content={this.getPopupContent()}
              position="bottom left"
              inverted
              hideOnScroll
            />
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
