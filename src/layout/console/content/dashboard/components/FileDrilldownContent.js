import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import {ChartClient} from "../../../../../clients/ChartClient";
import FrictionFileBubbleChart from "./FrictionFileBubbleChart";
import FrictionFileMetricTable from "./FrictionFileMetricTable";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class FileDrilldownContent extends Component {
  /**
   * the constructor function which builds the DashboardContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FileDrilldownContent.name + "]";
    this.state = {
      tableDto: null,
      selectedRowId: null,
      hoverRowId: null
    }
  }

  componentDidMount() {
    //given project.box as passed in prop, go and get the file data...

    ChartClient.chartTopFilesForBox(
      "gt[*]", "tc-desktop", "js",
      this,
      (arg) => {
        console.log("Chart data returned!");
        if (!arg.error) {
          console.log(arg.data);
          this.setState({
            tableDto: arg.data
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

  onClickCircle = (rowId) => {
    this.setState({
      selectedRowId : rowId
    });
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      <div
        id="component"
        className="dashboardContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.FLOW_PANEL
          ),
        }}
      >
        <FrictionFileBubbleChart tableDto={this.state.tableDto}
                                selectedRowId={this.state.selectedRowId}
                                hoverRowId={this.state.hoverRowId}
                                onHoverCircle={this.onHoverCircle}
                                onClickCircle={this.onClickCircle}
        />
        <FrictionFileMetricTable tableDto={this.state.tableDto}
                                selectedRowId={this.state.selectedRowId}
                                hoverRowId={this.state.hoverRowId}
                                onHoverMetricRow={this.onHoverMetricRow}
                                onClickMetricRow={this.onClickMetricRow}/>
      </div>
    );
  }
}
