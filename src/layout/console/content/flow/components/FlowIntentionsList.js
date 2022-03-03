import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import IntentionRow from "./IntentionRow";
import IntentionsHeader from "./IntentionsHeader";
import UtilRenderer from "../../../../../UtilRenderer";

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

    return (
      <div>
        <div id="component" className="intentionsList">
          <Grid
            id="intentions-row-grid"
            inverted
            columns={16}
          >
            <IntentionsHeader />
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
              {this.props.chartDto.eventSeriesByType[
                "@work/intent"
              ].rowsOfPaddedCells.map((d, i) => {
                let timer =
                  UtilRenderer.getRelativeTimerAsHoursMinutes(
                    parseInt(d[2], 10)
                  );
                let description = d[3];
                let offset = parseInt(d[2], 10);
                let flameRating = d[4].trim();
                let isActiveRow =
                  this.state.selectedRowOffset === offset;

                return (
                  <IntentionRow
                    key={i}
                    time={timer}
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
