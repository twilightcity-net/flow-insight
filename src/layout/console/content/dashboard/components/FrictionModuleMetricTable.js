import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import FrictionBoxMetricHeader from "./FrictionBoxMetricHeader";
import FrictionBoxMetricRow from "./FrictionBoxMetricRow";
import UtilRenderer from "../../../../../UtilRenderer";
import {scrollTo} from "../../../../../UtilScroll";
import FrictionModuleMetricRow from "./FrictionModuleMetricRow";
import FrictionModuleMetricHeader from "./FrictionModuleMetricHeader";

/**
 * this is the gui component that displays the friction metrics that correspond
 * to the bubble chart, the rows in the table are correlated on hover with the contents
 * of the chart
 */
export default class FrictionModuleMetricTable extends Component {
  /**
   * builds the flow intentions list beneath the FlowMap
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FrictionModuleMetricTable]";
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.selectedRowId && prevProps.selectedRowId !== this.props.selectedRowId) {
      this.scrollToItemById(this.props.selectedRowId, () => {});
    }
  }

  onClickMetric = (rowId) => {
    let newSelectedRowId = null;
    if (
      this.props.selectedRowId !== rowId
    ) {
      newSelectedRowId = rowId;
    }

    this.props.onClickMetricRow(newSelectedRowId);
  };

  onHoverMetric = (rowId) => {
    this.props.onHoverMetricRow(rowId);
  }

  scrollToItemById(id, callback) {
    let rootElement = document.getElementById(
        "metric-row-grid"
      ),
      parentElement = rootElement.parentElement,
      smoothStr = "smooth",
      theHeight = 0;

    let array = rootElement.children;
    for (let i = 0; i < array.length; i++) {
      let obj = array[i];

      if (obj.id === id + "-row") {
        theHeight -=
          parentElement.offsetHeight / 2 +
          obj.offsetHeight / 2;
        break;
      }
      theHeight += obj.offsetHeight;
    }

    scrollTo(parentElement, {
      behavior: smoothStr,
      top: theHeight,
    }).then(callback);
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
        <div id="component" className="frictionMetricList" >
          <Grid
            id="metric-header-row-grid"
            inverted
            columns={16}
          >
            <FrictionModuleMetricHeader />
          </Grid>
          <div className="scrolling">
            <Grid
              id="metric-row-grid"
              inverted
              columns={16}
              className="rows"
            >
              {rows.map((d, i) => {

                let id = d[0].trim();
                let duration = Math.round(UtilRenderer.getSecondsFromDurationString(d[1].trim())*parseFloat(d[2])/100);
                let confusion = Math.round(parseFloat(d[2].trim()));

                let confusionDurationFriendly = UtilRenderer.getTimerString(duration);
                let feels = parseFloat(d[7]);

                if (duration <= 0) {
                  return "";
                }

                return (<FrictionModuleMetricRow
                  key={i}
                  id={id}
                  module={id}
                  confusionTime={confusionDurationFriendly}
                  confusionPercent={confusion}
                  feels={feels}
                  isActiveRow={this.props.selectedRowId === id}
                  isHoverRow={this.props.hoverRowId === id}
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
