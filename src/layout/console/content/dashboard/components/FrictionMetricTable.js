import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import FrictionMetricHeader from "./FrictionMetricHeader";
import FrictionMetricRow from "./FrictionMetricRow";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this is the gui component that displays the friction metrics that correspond
 * to the bubble chart, the rows in the table are correlated on hover with the contents
 * of the chart
 */
export default class FrictionMetricTable extends Component {
  /**
   * builds the flow intentions list beneath the FlowMap
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionMetricTable]";
    this.state = {
      selectedRowId: null
    }
  }

  onClickMetric = (rowId) => {
    console.log("row click! " + rowId);
    let newSelectedRowId = null;
    if (
      this.state.selectedRowId !== rowId
    ) {
      newSelectedRowId = rowId;
    }

    this.props.onClickMetricRow(newSelectedRowId);

    this.setState({
      selectedRowId: newSelectedRowId,
    });
  };

  onHoverMetric = (rowId) => {
    console.log("hovering! "+rowId);
  }
  /**
   * renders the list of intentions belonging to the task
   * @returns {*}
   */
  render() {
    if (!this.props.tableDto) {
      return "";
    }

    let rows = this.props.tableDto.rowsOfPaddedCells;


    return (
        <div id="component" className="frictionMetricList">
          <Grid
            id="metric-header-row-grid"
            inverted
            columns={16}
          >
            <FrictionMetricHeader />
          </Grid>
          <div className="scrolling">
            <Grid
              id="metric-row-grid"
              inverted
              columns={16}
              className="rows"
            >
              {rows.map((d, i) => {

                let id = d[0].trim() + "-" + d[1].trim();
                let duration = Math.round(UtilRenderer.getSecondsFromDurationString(d[2].trim()));
                let confusion = Math.round(parseFloat(d[3].trim()));
                let confusionDuration = Math.round((confusion * duration) / 100);

                let confusionDurationFriendly = UtilRenderer.getTimerString(confusionDuration);
                let feels = parseFloat(d[8]);

                return (<FrictionMetricRow
                  key={i}
                  id={id}
                  project={d[0].trim()}
                  box={d[1].trim()}
                  confusionTime={confusionDurationFriendly}
                  confusionPercent={confusion}
                  feels={feels}
                  isActiveRow={this.state.selectedRowId === id}
                  onRowClick={this.onClickMetric}
                  onHover={this.onHoverMetric}
                />);
              })}
            </Grid>
          </div>
        </div>
    );
  }
}
