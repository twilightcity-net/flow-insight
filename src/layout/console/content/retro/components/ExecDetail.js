import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import { Segment, Menu, Grid } from "semantic-ui-react";
import ExecMetricsRow from "./ExecMetricsRow";
import ExecMetricsHeader from "./ExecMetricsHeader";
import UtilRenderer from "../../../../../UtilRenderer";
import { MemberClient } from "../../../../../clients/MemberClient";

/**
 * this is the gui component that displays the details of all our metrics for the troubleshooting session,
 * like what files were worked on, what tests were executed, how long they took, that sorta stuff
 */
export default class ExecDetail extends Component {
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
    this.name = "[ExecDetail]";
    this.me = MemberClient.me;
    this.loadCount = 0;
  }

  /**
   * event handle for the vertical panel resize. Adjust the feed panel height
   * when we are resizing so things look nice
   * @param size
   */
  onSecondaryPaneSizeChange = (size) => {
    document.getElementById(
      ExecDetail.circuitContentFeedPanelID
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
    let execData =
      this.props.chartDto.featureSetsByType[
        UtilRenderer.EXEC_DATA
      ];

    return (
      <Grid id="metrics-row-grid" inverted columns={16}>
        <ExecMetricsHeader />
        {execData.rowsOfPaddedCells.map((row, i) => {
          let process = row[0].trim();
          let tExecTime = row[1].trim();
          let tHumanTime = row[2].trim();
          let count = row[5].trim();
          let red = row[6].trim();
          let green = row[7].trim();
          let debug = row[8].trim();

          return (
            <ExecMetricsRow
              key={i}
              process={process}
              tExecTime={tExecTime}
              tHumanTime={tHumanTime}
              count={count}
              red={red}
              green={green}
              debug={debug}
            />
          );
        })}
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
              Top Executable Activity
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
