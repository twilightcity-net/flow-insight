import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import IntentionRow from "./IntentionRow";
import IntentionsHeader from "./IntentionsHeader";
import UtilRenderer from "../../../../../../UtilRenderer";

/**
 * this is the gui component that displays the scrollable intentions that make up a task,
 * that can be clicked to update the cursor position on the displayed FlowMap
 */
export default class FlowIntentionsList extends Component {
  /**
   * builds the flow intentions list beneath the FlowMap
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowIntentionsList]";
    this.state = {
      selectedRowOffset: null,
    };
  }

  onRowClick = (selectedRowOffset) => {
    console.log("row click! " + selectedRowOffset);

    let newSelectedOffset = null;
    if (
      this.state.selectedRowOffset !== selectedRowOffset
    ) {
      newSelectedOffset = selectedRowOffset;
    }

    this.props.onClickIntention(newSelectedOffset);

    this.setState({
      selectedRowOffset: newSelectedOffset,
    });
  };
  /**
   * renders the list of intentions belonging to the task
   * @returns {*}
   */
  render() {
    if (!this.props.chartDto) {
      return "";
    }

    const intentionMap = this.props.chartDto.eventSeriesByType["@work/intent"].rowsOfPaddedCells;
    const intentionHeaders = this.props.chartDto.eventSeriesByType["@work/intent"].headers;

    console.log("headers = ");
    console.log(intentionHeaders);

    let hasTaskAt4 = false;
    if (intentionHeaders[4].trim() === "Task") {
      hasTaskAt4 = true;
    }

    //let hasTask = (intentionHeaders[])
    // "Coords              "
    // 1: "Time                "
    // 2: "Offset "
    // 3: "Intention                                                                                                                                                                                                                                                                                                                             "
    // 4: "Task      "
    // 5: "FlameRating "
    // 6: "Event "

    return (
      <div>
        <div id="component" className="intentionsList">
          <Grid
            id="intentions-row-grid"
            inverted
            columns={16}
          >
            <IntentionsHeader hasTaskColumn={hasTaskAt4}/>
          </Grid>
          <div className="scrolling">
            <Grid
              id="intentions-row-grid"
              inverted
              columns={16}
              className="rows"
              onMouseLeave={() =>
                this.props.onExitHoverIntention()
              }
            >
              {intentionMap.map((d, i) => {
                let timer =
                  UtilRenderer.getRelativeTimerAsHoursMinutes(
                    parseInt(d[2], 10)
                  );
                let description = d[3];
                let offset = parseInt(d[2], 10);

                let task = "";
                let flameRating = "";
                if (hasTaskAt4) {
                  task = d[4].trim();
                  flameRating = d[5].trim();
                } else {
                  flameRating = d[4].trim();
                }
                let isActiveRow = this.state.selectedRowOffset === offset;

                return (
                  <IntentionRow
                    key={i}
                    time={timer}
                    task={task}
                    description={description}
                    flameRating={flameRating}
                    offset={offset}
                    onHover={this.props.onHoverIntention}
                    isActiveRow={isActiveRow}
                    onRowClick={this.onRowClick}
                  />
                );
              })}
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}
