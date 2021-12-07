import React, { Component } from "react";
import {
  Divider,
  Grid,
  Icon,
  Popup,
} from "semantic-ui-react";
/**
 * this component is the individual metrics item for a top exec entry
 */
export default class FileMetricsRow extends Component {
  /**
   * builds our metrics item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ExecMetricsRow]";
    this.state = {};
  }

  /**
   * handles clicking on our metrics item. This will eventually allow for opening a chart or stats
   * related to the exec.  No-op for now.
   */
  handleOnClickRow = () => {
    // this.props.onRowClick(this);
  };

  /**
   * renders our exec process cell in the grid.
   * @returns {*}
   */
  getExecProcessContent() {
    return (
      <div className="chunkTitle">{this.props.process}</div>
    );
  }

  /**
   * renders our fail count cell in the grid.
   * @returns {*}
   */
  getRedCountCellContent() {
    return (
      <div className="chunkText">{this.props.red}</div>
    );
  }

  /**
   * renders our green count cell in the grid.
   * @returns {*}
   */
  getGreenCountCellContent() {
    let greenCount = this.props.green;

    if (greenCount === "0" && this.props.red === "0") {
      greenCount = this.props.count;
    }

    return <div className="chunkText">{greenCount}</div>;
  }

  /**
   * renders our duration cell in our grid
   * @returns {*}
   */
  getDurationCellContent() {
    let totalTime = this.props.tHumanTime;

    if (totalTime === null || totalTime.length === 0) {
      totalTime = this.props.tExecTime;
    }

    return <div className="chunkText">{totalTime}</div>;
  }

  /**
   * renders our gui for the popup information.
   * @returns {*}
   */
  getPopupContent() {
    let humanTime = this.props.tHumanTime;
    if (humanTime === null || humanTime.length === 0) {
      humanTime = "--";
    }

    let greenCount = this.props.green;

    if (greenCount === "0" && this.props.red === "0") {
      greenCount = this.props.count;
    }

    return (
      <div>
        <div>
          <b>
            <span className="tipHighlight">
              {" "}
              {this.props.process}{" "}
            </span>
          </b>
        </div>
        <Divider />
        <div>
          <span className="leftcol">
            <i>ExecTime:</i>
          </span>
          <span className="rightcol">
            <i>{this.props.tExecTime}</i>
          </span>
        </div>
        <div>
          <span className="leftcol">
            <i>HumanTime:</i>
          </span>
          <span className="rightcol">
            <i>{humanTime}</i>
          </span>
        </div>

        <Divider />
        <div>
          <span className="execstats">
            {this.props.count} cycles |{" "}
            <span className="fail">{this.props.red}</span> |{" "}
            <span className="pass">{greenCount}</span> |{" "}
            {this.props.debug} <Icon name="bug" />
          </span>
        </div>
      </div>
    );
  }

  /**
   * renders our metrics item in our grid for the console
   * @returns {*}
   */
  render() {
    let execNameCell = this.getExecProcessContent(),
      durationCell = this.getDurationCellContent(),
      redCountCell = this.getRedCountCellContent(),
      greenCountCell = this.getGreenCountCellContent(),
      popupContent = this.getPopupContent();

    return (
      <Grid.Row
        id={1}
        className={"metricRow"}
        onClick={this.handleOnClickRow}
      >
        <Grid.Column width={8}>
          <Popup
            flowing
            style={{ minWidth: 200 }}
            trigger={execNameCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
        <Grid.Column width={3}>
          <Popup
            flowing
            style={{ minWidth: 200 }}
            trigger={durationCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
        <Grid.Column width={2}>
          <Popup
            flowing
            style={{ minWidth: 200 }}
            trigger={redCountCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
        <Grid.Column width={3}>
          <Popup
            flowing
            style={{ minWidth: 200 }}
            trigger={greenCountCell}
            className="metricContent"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
      </Grid.Row>
    );
  }
}
