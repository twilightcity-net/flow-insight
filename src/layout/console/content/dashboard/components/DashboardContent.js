import React, {Component} from "react";
import {ChartClient} from "../../../../../clients/ChartClient";
import {DimensionController} from "../../../../../controllers/DimensionController";
import FrictionBoxBubbleChart from "./FrictionBoxBubbleChart";
import FrictionBoxMetricTable from "./FrictionBoxMetricTable";
import FrictionFileMetricTable from "./FrictionFileMetricTable";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class DashboardContent extends Component {
  /**
   * the constructor function which builds the DashboardContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + DashboardContent.name + "]";
    this.state = {
      drillDownProject: null,
      drillDownBox: null,
      boxTableDto: null,
      fileTableDto: null,
      selectedRowId: null,
      hoverRowId: null
    }
  }

  componentDidMount() {
    this.loadBoxesData();
  }

  drillDownToFileView = (project, box) => {
    console.log("drillDownToFileView");

    this.loadBoxDetailData(project, box);

  }

  zoomOutToBoxView = () => {
    console.log("zoomOutToBoxView");
    this.setState({
      drillDownProject: null,
      drillDownBox: null,
      fileTableDto: null
    });
  }

  loadBoxesData() {
    ChartClient.chartTopBoxes(
      "gt[*]",
      this,
      (arg) => {
        console.log("Chart data returned!");
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            boxTableDto: arg.data
          });
        } else {
          console.error(arg.error);
          //TODO this should load an error page
        }
      }
    );
  }

  loadBoxDetailData(project, box) {
    ChartClient.chartTopFilesForBox(
      "gt[*]", project, box,
      this,
      (arg) => {
        console.log("Chart data returned!");
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            fileTableDto: arg.data,
            drillDownProject: project,
            drillDownBox: box,
          });
        } else {
          console.error(arg.error);
          //TODO this should load an error page
        }
      }
    );
  }


  onClickMetricRow = (rowId) => {
    this.setState({
      selectedRowId : rowId
    });
  }

  onHoverMetricRow = (rowId) => {
    this.setState({
      hoverRowId : rowId
    });
  }

  onHoverCircle = (rowId) => {
    this.setState({
      hoverRowId : rowId
    });
  }

  onClickCircle = (rowId, project, box) => {
    if (this.state.drillDownBox === null) {
      this.drillDownToFileView(project, box);
    } else {
      this.setState({
        selectedRowId : rowId
      });
    }
  }



  /**
   * renders the main dashboard content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let tableContent = "";

    if (this.state.drillDownBox) {
      tableContent =  <FrictionFileMetricTable tableDto={this.state.fileTableDto}
                                               selectedRowId={this.state.selectedRowId}
                                               hoverRowId={this.state.hoverRowId}
                                               onHoverMetricRow={this.onHoverMetricRow}
                                               onClickMetricRow={this.onClickMetricRow}/>

    } else {
      tableContent = <FrictionBoxMetricTable tableDto={this.state.boxTableDto}
                                             selectedRowId={this.state.selectedRowId}
                                             hoverRowId={this.state.hoverRowId}
                                             onHoverMetricRow={this.onHoverMetricRow}
                                             onClickMetricRow={this.onClickMetricRow}/>
    }

    return (<div
      id="component"
      className="dashboardContent"
      style={{
        height: DimensionController.getHeightFor(
          DimensionController.Components.FLOW_PANEL
        ),
      }}
    >
      <FrictionBoxBubbleChart tableDto={this.state.boxTableDto}
                              fileTableDto={this.state.fileTableDto}
                              drilldownBox={this.state.drillDownBox}
                              selectedRowId={this.state.selectedRowId}
                              hoverRowId={this.state.hoverRowId}
                              onHoverCircle={this.onHoverCircle}
                              onClickCircle={this.onClickCircle}
                              zoomOutToBoxView={this.zoomOutToBoxView}
      />
      {tableContent}
    </div>);

  }
}
