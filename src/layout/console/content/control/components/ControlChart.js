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
    this.height = Math.round(DimensionController.getFlowPanelHeight());
    this.width = Math.round(DimensionController.getFlowPanelWidth() * 0.7);

    this.margin = 30;
    this.topMargin = 40;
    this.topChartMargin = 65;
    this.bottomChartMargin = this.topChartMargin * 2;
    this.leftAxisMargin = 40;
    this.tooltipPositionPercent = 0.7;

    this.boxWidth = (this.width - this.margin * 2 - this.leftAxisMargin);
    this.boxHeight = (this.height - this.bottomChartMargin);

    this.controlLineMargin = Math.floor((this.height - this.bottomChartMargin) / 4);
    this.zeroLineMargin = 40;


    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

    let rows = chartDto.chartSeries.rowsOfPaddedCells;
    let currentWeek = chartDto.position;

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", this.height + "px");

    const chartGroup = svg.append("g").attr("class", "ifm");

    this.drawTitle(chartGroup, currentWeek);
    this.drawNavLinks(svg, chartGroup);

    this.drawChartBox(chartGroup);
    this.drawAxisLabels(chartGroup);

    let troubleRows = this.createTroubleRows(rows);

    this.drawTicksForPoints(chartGroup, troubleRows);
    this.drawPoints(chartGroup, troubleRows);
  }

  /**
   * Draw the graph points of our control chart
   * @param chartGroup
   * @param rows
   */
  drawPoints(chartGroup, rows) {
    let rowCount = rows.length;
    let tickOffset = this.boxWidth / (rowCount + 1);

    let dataHeight = this.boxHeight - this.controlLineMargin - this.zeroLineMargin;

    let dataScaleFn = d3.scaleLinear()
      .domain([0, 3000])
      .range([0, dataHeight]);


    chartGroup.selectAll("graphLine")
      .data(rows)
      .enter()
      .append("line")
      .attr("stroke", "#333333")
      .attr("x1", (d, i) => this.margin + this.leftAxisMargin + (tickOffset * (i)) )
      .attr("x2", (d, i) => this.margin + this.leftAxisMargin + (tickOffset * (i+1)) )
      .attr("y1", (d) => {
        if (d.previousRow) {
          return this.translateDurationToPosition(dataScaleFn, d.previousRow.durationInSeconds);
        } else {
          return this.topChartMargin + this.boxHeight - this.zeroLineMargin;
        }
      })
      .attr("y2", (d) => this.translateDurationToPosition(dataScaleFn, d.durationInSeconds))

    if (rows.length > 0) {
      chartGroup
        .append("line")
        .attr("stroke", "#333333")
        .attr("x1", this.margin + this.leftAxisMargin + (tickOffset * (rows.length)) )
        .attr("x2", this.margin + this.leftAxisMargin + this.boxWidth )
        .attr("y1", this.translateDurationToPosition(dataScaleFn, rows[rows.length - 1].durationInSeconds))
        .attr("y2", this.topChartMargin + this.boxHeight - this.zeroLineMargin);
    }

    chartGroup.selectAll("graphPoint")
      .data(rows)
      .enter()
      .append("circle")
      .attr("id", (d) => d.circuitName)
      .attr("fill", "#ff0000")
      .attr("stroke", "#000000")
      .attr("cx", (d, i) => this.margin + this.leftAxisMargin + (tickOffset * (i+1)))
      .attr("cy", (d) => this.translateDurationToPosition(dataScaleFn, d.durationInSeconds))
      .attr("r", 4);
  }

  /**
   * Translate the duration of a graph point to a chart position
   * @param dataScaleFn
   * @param durationInSeconds
   */
  translateDurationToPosition(dataScaleFn, durationInSeconds) {
     let offset = dataScaleFn(durationInSeconds);
     let lowestOffset = this.topChartMargin;

     let pointOffset = this.topChartMargin + this.boxHeight - this.zeroLineMargin - offset;
     if (pointOffset < lowestOffset) {
       pointOffset = lowestOffset;
     }
     return pointOffset;
  }

  /**
   * Clean up our dataset properties to make it easier to display the chart data
   * @param rows
   */
  createTroubleRows(rows) {
    let troubleRows = [];

    let prevRow = null;

    rows.forEach(row => {
      let troubleRow = {
         username: row[0].trim(),
         fullName: row[1].trim(),
         circuitName: row[2].trim(),
         durationInSeconds: parseInt(row[3].trim(), 10),
         coords: row[4].trim(),
         solvedTime: row[5].trim(),
         retroTime: row[6].trim(),
         status: row[7].trim(),
         description: row[8].trim(),
         previousRow: prevRow
      };
      troubleRows.push(troubleRow);

      prevRow = troubleRow;
    });

    return troubleRows;
  }

  /**
   * Draw tick parts for each point, evenly distributed
   */
  drawTicksForPoints(chartGroup, rows) {

    let rowCount = rows.length;
    let tickOffset = this.boxWidth / (rowCount + 1);

    chartGroup
      .selectAll("ticks")
      .data(rows)
      .enter()
      .append("line")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x1", (d, i) => this.margin + this.leftAxisMargin + (tickOffset * (i+1)) )
      .attr("x2", (d, i) => this.margin + this.leftAxisMargin + (tickOffset * (i+1)) )
      .attr("y1", this.topChartMargin + this.boxHeight - 5)
      .attr("y2", this.topChartMargin + this.boxHeight + 5);

  }

  /**
   * Draw the background box for the size of the chart
   * @param chartGroup
   */
  drawChartBox(chartGroup) {
    chartGroup
      .append("rect")
      .attr("fill", "rgba(10, 10, 10, 0.96)")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x", this.margin + this.leftAxisMargin)
      .attr("y", this.topChartMargin)
      .attr("width", this.boxWidth)
      .attr("height", this.boxHeight);

    chartGroup.append("line")
      .attr("stroke", "#ff0000")
      .attr("x1", this.margin + this.leftAxisMargin - 10)
      .attr("x2", this.margin + this.leftAxisMargin + this.boxWidth - 1)
      .attr("y1", this.topChartMargin + this.controlLineMargin)
      .attr("y2", this.topChartMargin + this.controlLineMargin);

    chartGroup.append("line")
      .attr("stroke", "#aaaaaa")
      .attr("x1", this.margin + this.leftAxisMargin - 10)
      .attr("x2", this.margin + this.leftAxisMargin + this.boxWidth - 1)
      .attr("y1", this.topChartMargin + this.boxHeight - this.zeroLineMargin)
      .attr("y2", this.topChartMargin + this.boxHeight - this.zeroLineMargin);

  }

  /**
   * Draw the axis labels for the control lines
   * @param chartGroup
   */
  drawAxisLabels(chartGroup) {
    chartGroup.append("text")
      .attr("fill", "#ff0000")
      .attr("x", this.margin + this.leftAxisMargin - 20)
      .attr("y", this.topChartMargin + this.controlLineMargin)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .text("50min");

    chartGroup.append("text")
      .attr("fill", "#aaaaaa")
      .attr("x", this.margin + this.leftAxisMargin - 20)
      .attr("y", this.topChartMargin + this.boxHeight - this.zeroLineMargin)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .text("0 min");

    chartGroup.append("text")
      .attr("fill", "#960000")
      .attr("x", this.margin + this.leftAxisMargin - 20)
      .attr("y", this.topChartMargin + 10)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .text("^^^");
  }

  /**
   * Draw the chart title
   * @param chartGroup
   * @param currentWeek
   */
  drawTitle(chartGroup, currentWeek) {
    chartGroup
      .append("text")
      .attr("class", "title")
      .attr("x", this.margin)
      .attr("y", this.topMargin)
      .attr("text-anchor", "start")
      .text(this.getTitleBasedOnWeekOffset(currentWeek));
  }

  /**
   * Get the title for the chart based on whether it's the current week, last week,
   * or a specific date if older than that
   * @param currentWeek
   */
  getTitleBasedOnWeekOffset(currentWeek) {
    let offset = this.props.weekOffset;

    if (offset === 0) {
      return "This Week's Trouble Control";
    } else if (offset === -1) {
      return "Last Week's Trouble Control";
    } else if (offset < -1) {
      let calDate = UtilRenderer.getDateString(currentWeek.trim());
      return "Week of " + calDate + " Trouble Control";
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
