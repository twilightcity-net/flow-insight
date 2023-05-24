import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this is the gui component that displays the wtfs control chart
 */
export default class ControlChart extends Component {
  /**
   * builds the control chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ControlChart]";
  }


  /**
   * Initially when we get the first set of props, display our chart data.
   */
  componentDidMount() {
    if (this.props.chartDto) {
      this.displayChart(
        this.props.chartDto
      );
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.weekOffset !== this.props.weekOffset) {
      this.displayChart(this.props.chartDto);
    }
  }

  /**
   * Display the latest wtfs chart on the screen
   * @param chartDto
   */
  displayChart(chartDto) {
    this.margin = 30;
    this.topMargin = 40;
    this.topChartMargin = 70;
    this.tooltipPositionPercent = 0.7;
    this.height = Math.round(DimensionController.getFlowPanelHeight());
    this.width = Math.round(DimensionController.getFlowPanelWidth() * 0.7);
    this.cellMargin = 10;
    this.weekendExtraMargin = 20;

    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

    let rows = chartDto.chartSeries.rowsOfPaddedCells;

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", this.height + "px");

    const chartGroup = svg.append("g").attr("class", "ifm");

    this.drawTitle(chartGroup, []);
    this.drawNavLinks(svg, chartGroup);
  }


  /**
   * Draw the chart title
   * @param chartGroup
   * @param dailyRows
   */
  drawTitle(chartGroup, dailyRows) {
    chartGroup
      .append("text")
      .attr("class", "title")
      .attr("x", this.margin)
      .attr("y", this.topMargin)
      .attr("text-anchor", "start")
      .text("Title goes here");
  }

  /**
   * Get the title for the chart based on whether it's the current week, last week,
   * or a specific date if older than that
   * @param dailyRows
   */
  getTitleBasedOnWeekOffset(dailyRows) {
    let offset = this.props.weekOffset;

    if (offset === 0) {
      return "This Week's Programming Flow";
    } else if (offset === -1) {
      return "Last Week's Programming Flow";
    } else if (offset < -1) {
      if (dailyRows.length > 0) {
        let day = UtilRenderer.getDateString(dailyRows[0].calDate);
        return "Week of "+day + " Programming Flow";
      } else {
        return "Week's Programming Flow";
      }
    }
  }


  /**
   * Draw the navigation links in the bottom left hand corner
   * @param svg
   * @param chartGroup
   */
  drawNavLinks(svg, chartGroup) {
    let textWidth = 80;

    let that = this;
    chartGroup
      .append("text")
      .attr("class", "navlink")
      .attr("x", this.margin )
      .attr("y", this.height - this.topMargin/4*3)
      .attr("text-anchor", "start")
      .text(this.getPreviousLinkName())
      .on("click", function (event) {
        that.onClickPrevWeek();
      });

    if (this.props.weekOffset < 0) {
      chartGroup
        .append("text")
        .attr("class", "navlink")
        .attr("x", this.margin + textWidth)
        .attr("y", this.height - this.topMargin/4*3)
        .attr("text-anchor", "start")
        .text("Next >")
        .on("click", function (event) {
          that.onClickNextWeek();
        });
    }
  }

  getPreviousLinkName() {
    if (this.props.weekOffset === 0) {
      return "< Previous Week";
    } else {
      return "< Previous";
    }
  }

  onClickPrevWeek() {
    console.log("Clicking previous week button!");
    this.props.onClickNavWeek(-1);
  }

  onClickNextWeek() {
    console.log("Clicking next week button!");
    this.props.onClickNavWeek(1);
  }


  /**
   * renders the svg display of the chart with d3 support
   * These divs are populated via the displayChart() call
   * @returns {*}
   */
  render() {

    console.log("Rendering our control chart");
    return (
      <div>
        <div id="chart" />
        <div
          id="tooltip"
          className="chartpopup"
        />
      </div>
    );
  }
}
