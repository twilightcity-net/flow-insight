import React, {Component} from "react";
import {Grid, Popup, Segment} from "semantic-ui-react";
import UtilRenderer from "../../../../../../UtilRenderer";
import {scrollTo} from "../../../../../../UtilScroll";
import MomentumMetricHeader from "./MomentumMetricHeader";
import MomentumMetricRow from "./MomentumMetricRow";
import TaskMetricRow from "./TaskMetricRow";
import TaskMetricHeader from "./TaskMetricHeader";
import * as d3 from "d3";

/**
 * this is the gui component that displays the task summary drilldowns
 * from the momentum chart
 */
export default class TaskMetricTable extends Component {
  /**
   * builds the table to the right of the bubble chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TaskMetricTable]";
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
    let rows = [];
    let noRowsRow = "";
    if (this.props.taskTableDto) {
      rows = this.props.taskTableDto.rowsOfPaddedCells;
    } else {
      noRowsRow = <div className="placeholder">Click a box to see task momentum for the day.</div>
    }

    let mScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([0, 1]);

    var interp = d3
      .scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);


    return (
        <div id="component" className="frictionMetricList" >
          <Grid
            id="metric-header-row-grid"
            inverted
            columns={16}
          >
            <TaskMetricHeader bucketSize={this.props.bucketSize}/>
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
              {noRowsRow}



              {rows.map((d, i) => {
                let id = i;
                let projectName = d[0].trim();
                let taskName = d[1].trim();
                let duration = UtilRenderer.getSecondsFromDurationString(d[2].trim());
                let friendlyDuration = UtilRenderer.getTimerString(duration);

                let confusionPercent = parseFloat(d[3].trim());
                let confusionDuration = Math.round(duration * confusionPercent / 100);
                let friendlyConfusionDuration = UtilRenderer.getTimerString(confusionDuration);

                if (confusionDuration === 0) {
                  friendlyConfusionDuration = 'None';
                }

                let description = d[10].trim();

                let momentum = parseInt(d[7]);


                let momentumColor = interp(mScale(momentum));

                console.log("color = "+momentumColor);

                if (duration <= 0) {
                  return "";
                }

                return (<TaskMetricRow
                  key={id}
                  id={id}
                  projectName={projectName}
                  taskName={taskName}
                  taskDescription={description}
                  duration={friendlyDuration}
                  confusionPercent={confusionPercent}
                  confusionDuration={friendlyConfusionDuration}
                  momentum={momentum}
                  momentumColor={momentumColor}
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
