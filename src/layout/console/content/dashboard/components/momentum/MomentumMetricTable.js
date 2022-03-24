import React, {Component} from "react";
import {Grid} from "semantic-ui-react";
import UtilRenderer from "../../../../../../UtilRenderer";
import {scrollTo} from "../../../../../../UtilScroll";
import MomentumMetricHeader from "./MomentumMetricHeader";
import MomentumMetricRow from "./MomentumMetricRow";

/**
 * this is the gui component that displays the momentum metrics that correspond
 * to the momentum calendar chart, the rows in the table are correlated on hover with the contents
 * of the chart
 */
export default class MomentumMetricTable extends Component {
  /**
   * builds the table to the right of the bubble chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[MomentumMetricTable]";
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
    if (!this.props.chartDto) {
      return "";
    }

    let rows = this.props.chartDto.chartSeries.rowsOfPaddedCells;

    return (
        <div id="component" className="frictionMetricList" >
          <Grid
            id="metric-header-row-grid"
            inverted
            columns={16}
          >
            <MomentumMetricHeader bucketSize={this.props.bucketSize}/>
          </Grid>
          <div className="scrolling"
               onMouseLeave={() => {
                 this.onHoverMetric(null);
               }}>
            <Grid
              id="metric-row-grid"
              inverted
              columns={16}
              className="rows"
            >
              {rows.map((d, i) => {

                let id = d[0].trim() + "-row";
                let day = UtilRenderer.getDateString(new Date(d[1].trim()));
                let duration = parseInt(d[2].trim(), 10);
                let confusionDuration = Math.round(duration * parseFloat(d[4].trim()) / 100);

                let friendlyDuration = UtilRenderer.getTimerString(duration);
                let friendlyConfusionDuration = UtilRenderer.getTimerString(confusionDuration);

                let momentum = parseInt(d[8].trim(), 10);
                let feels = parseFloat(d[9].trim());

                if (duration <= 0) {
                  return "";
                }

                return (<MomentumMetricRow
                  key={id}
                  id={id}
                  day={day}
                  duration={friendlyDuration}
                  confusionDuration={friendlyConfusionDuration}
                  momentum={momentum}
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
