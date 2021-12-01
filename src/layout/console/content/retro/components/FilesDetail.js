import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import {
  Segment,
  Menu,
  Grid
} from "semantic-ui-react";
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
   * builds the active circuit feed component which is used by the circuit resource
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

    let fileData = this.props.chartDto.featureSetsByType[UtilRenderer.FILE_DATA];

    return (
      <Grid id="metrics-row-grid" inverted columns={16}>
       <FileMetricsHeader/>
        {
          fileData.rowsOfPaddedCells.map((row, i) => {
            let box = row[0].trim();
            let filePath = row[1].trim();
            let duration = row[2].trim();

            return <FileMetricsRow key={i} box={box} filePath={filePath} duration={duration}/>

          })
        }
      </Grid>
    );
  }

  /**
   * our click handler for our minimize button
   */
  handleClick = () => {
    this.props.hideSlidePanel();
  };

  /**
   * renders the active circuit feed into the console view
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
          <div id="component" className="metricsFilePanel">
            {this.getMetricsDetailContent()}
          </div>
        </Segment>
      </div>
    );
  }
}
