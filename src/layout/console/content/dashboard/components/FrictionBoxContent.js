import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import {ChartClient} from "../../../../../clients/ChartClient";
import FrictionBoxBubbleChart from "./FrictionBoxBubbleChart";
import FrictionBoxMetricTable from "./FrictionBoxMetricTable";

/**
 * this component is the friction box data summary panel
 */
export default class FrictionBoxContent extends Component {
  /**
   * the constructor function which builds the FrictionBoxContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FrictionBoxContent.name + "]";
    this.state = {
      tableDto: null,
      selectedRowId: null,
      hoverRowId: null
    }
  }

  componentDidMount() {
    ChartClient.chartTopBoxes(
      "gt[*]",
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
        <FrictionBoxBubbleChart tableDto={this.state.tableDto}
                                selectedRowId={this.state.selectedRowId}
                                hoverRowId={this.state.hoverRowId}
                                onHoverCircle={this.onHoverCircle}
                                onClickCircle={this.onClickCircle}
        />
        <FrictionBoxMetricTable tableDto={this.state.tableDto}
                                selectedRowId={this.state.selectedRowId}
                                hoverRowId={this.state.hoverRowId}
                                onHoverMetricRow={this.onHoverMetricRow}
                                onClickMetricRow={this.onClickMetricRow}/>
      </div>
    );
  }
}
