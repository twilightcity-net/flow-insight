import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Segment, Menu, Grid } from "semantic-ui-react";
import FileMetricsRow from "./FileMetricsRow";
import FileMetricsHeader from "./FileMetricsHeader";
import UtilRenderer from "../../../../../UtilRenderer";
import { MemberClient } from "../../../../../clients/MemberClient";

/**
 * this is the gui component that displays the details of all our metrics for the troubleshooting session,
 * like what files were worked on, what tests were executed, how long they took, that sorta stuff
 */
export default class FilesDetail extends Component {
  /**
   * the dom el id name of the circuit feed content panel
   * @type {string}
   */
  static circuitContentFeedPanelID = "pastContentFeedPanel";

  /**
   * builds the file details component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FilesDetail]";
    this.me = MemberClient.me;
    this.lastFeedEvent = null;
    this.loadCount = 0;
  }

  /**
   * event handle for the vertical panel resize. Adjust the feed panel height
   * when we are resizing so things look nice
   * @param size
   */
  onSecondaryPaneSizeChange = (size) => {
    document.getElementById(
      FilesDetail.circuitContentFeedPanelID
    ).style.height =
      DimensionController.getActiveCircuitFeedContentHeight(
        size
      ) + "px";
  };

  /**
   * renders our metric details data
   * @returns {JSX.Element}
   */
  getMetricsDetailContent() {
    if (!this.props.chartDto) {
      return <div></div>;
    }

    let fileData =
      this.props.chartDto.featureSetsByType[
        UtilRenderer.FILE_DATA
      ];

    console.log(fileData);
    return (
      <div id="component" className="metricsPanel">
        <Grid id="metrics-row-grid" inverted columns={16}>
          <FileMetricsHeader />
        </Grid>
        <div
          className="scrolling"
          style={{
            maxHeight:
              DimensionController.getActiveCircuitContentHeight() -
              90 +
              "px",
          }}
        >
          <Grid
            id="metrics-row-grid"
            className="rows"
            inverted
            columns={16}
          >
            {fileData.rowsOfPaddedCells.map((row, i) => {
              let box = row[0].trim();
              let filePath = row[1].trim();
              let duration = UtilRenderer.getSecondsFromDurationString(row[2].trim());
              let percentConfusion = parseFloat(row[3].trim());
              let modified = row[9].trim();

              let confusionDuration = UtilRenderer.getTimerStringFromTimeDurationSeconds(Math.round(duration * percentConfusion / 100));

              return (
                <FileMetricsRow
                  key={i}
                  box={box}
                  filePath={filePath}
                  duration={confusionDuration}
                  modified={modified}
                />
              );
            })}
          </Grid>
        </div>
      </div>
    );
  }

  /**
   * our click handler for our minimize button
   */
  handleClick = () => {
    this.props.hideSlidePanel();
  };

  /**
   * renders the metrics slide out panel for files
   * @returns {*}
   */
  render() {
    return (
      <div id="component" className="retroSlidePanel">
        <Segment inverted>
          <Menu icon inverted fluid secondary>
            <Menu.Item header className="metricHeader">
              Top File Activity
            </Menu.Item>
            <Menu.Item
              link
              position="right"
              icon="close"
              onClick={this.handleClick}
            />
          </Menu>
          {this.getMetricsDetailContent()}
        </Segment>
      </div>
    );
  }
}
