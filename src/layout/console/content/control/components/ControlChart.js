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

  static FIFTY_MIN_OOC_LIMIT_IN_SECONDS = 3000;

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

    let troublePoints = this.createTroubleGraphPoints(rows);

    this.drawTicksForPoints(chartGroup, troublePoints);
    this.drawLinesConnectingPoints(chartGroup, troublePoints);
    this.drawPoints(chartGroup, troublePoints);
  }


  /**
   * Clean up our dataset properties to make it easier to display the chart data
   * @param rows
   */
  createTroubleGraphPoints(rows) {
    let troublePoints = [];

    let rowCount = rows.length;
    let tickOffset = this.boxWidth / (rowCount + 1);

    let dataHeight = this.boxHeight - this.controlLineMargin - this.zeroLineMargin;

    let dataScaleFn = d3.scaleLinear()
      .domain([0, ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS]) //50 minutes
      .range([0, dataHeight]);

    let prevPoint = null;

    rows.forEach( (row, i) => {
      let troublePoint = {
        username: row[0].trim(),
        fullName: row[1].trim(),
        circuitName: row[2].trim(),
        durationInSeconds: parseInt(row[3].trim(), 10),
        coords: row[4].trim(),
        solvedTime: row[5].trim(),
        retroTime: row[6].trim(),
        status: row[7].trim(),
        description: row[8].trim(),
        previousPoint: prevPoint,
        xOffset: tickOffset * (i+1),
        yOffset: this.translateDurationToOffset(dataScaleFn, parseInt(row[3].trim(), 10))
      };
      troublePoints.push(troublePoint);
      prevPoint = troublePoint;
    });

    return troublePoints;
  }

  /**
   * Draw the little lines connecting all the graph points
   * @param chartGroup
   * @param points
   */
  drawLinesConnectingPoints(chartGroup, points) {

    chartGroup.selectAll("graphLine")
      .data(points)
      .enter()
      .append("line")
      .attr("class", "graphPointLine")
      .attr("x1", (d, i) => this.margin + this.leftAxisMargin + this.getXOffsetOrZeroIfNull(d.previousPoint))
      .attr("x2", (d, i) => this.margin + this.leftAxisMargin + d.xOffset)
      .attr("y1", (d) => {
        if (d.previousPoint) {
          return this.topChartMargin + d.previousPoint.yOffset;
        } else {
          return this.topChartMargin + this.boxHeight - this.zeroLineMargin;
        }
      })
      .attr("y2", (d) => this.topChartMargin + d.yOffset)

    //create the last line connecting the last point back to 0
    if (points.length > 0) {
      chartGroup
        .append("line")
        .attr("class", "graphPointLine")
        .attr("x1", this.margin + this.leftAxisMargin + points[points.length - 1].xOffset)
        .attr("x2", this.margin + this.leftAxisMargin + this.boxWidth )
        .attr("y1", this.topChartMargin + points[points.length - 1].yOffset)
        .attr("y2", this.topChartMargin + this.boxHeight - this.zeroLineMargin);
    }
  }

  /**
   * Draw the graph points of our control chart
   * @param chartGroup
   * @param points
   */
  drawPoints(chartGroup, points) {

    console.log(points);

    let that = this;

    //draw the points
    chartGroup.selectAll("graphPoint")
      .data(points)
      .enter()
      .append("circle")
      .attr("id", (d) => d.circuitName + "-point")
      .attr("class", (d) => this.getGraphPointStyleBasedOnStatus(d.status))
      .attr("cx", (d, i) => this.margin + this.leftAxisMargin + d.xOffset)
      .attr("cy", (d) => this.topChartMargin + d.yOffset)
      .attr("r", 4);

    //draw the Xs for the ooc points
    points.forEach((point, i) => {
      if (point.durationInSeconds > ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS) {
        chartGroup.append("text")
          .attr("id", point.circuitName + "-ooc")
          .attr("class", this.getXSizeBasedOnReviewed(point.status))
          .attr("x", this.margin + this.leftAxisMargin + point.xOffset)
          .attr("y", this.topChartMargin + point.yOffset + 2)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text("X");
      }
    });

    //draw target areas on top that are transparent and bigger to click
    chartGroup.selectAll("graphPointTarget")
      .data(points)
      .enter()
      .append("circle")
      .attr("id", (d) => d.circuitName + "-target")
      .attr("class", (d) => "graphPointTarget")
      .attr("cx", (d, i) => this.margin + this.leftAxisMargin + d.xOffset)
      .attr("cy", (d) => this.topChartMargin + d.yOffset)
      .attr("r", 10)
    .on("mouseover", function (event, d) {
      let graphPoint = document.getElementById(d.circuitName + "-point");
      graphPoint.classList.add("highlight");

      let xPoint = document.getElementById(d.circuitName + "-ooc");
      if (xPoint) {
        xPoint.classList.add("highlight");
      }
      that.onHoverGraphPoint(d);
    })
    .on("mouseout", function (event, d) {
      let graphPoint = document.getElementById(d.circuitName + "-point");
      graphPoint.classList.remove("highlight");

      let xPoint = document.getElementById(d.circuitName + "-ooc");
      if (xPoint) {
        xPoint.classList.remove("highlight");
      }
      that.onHoverOffGraphPoint(d);
    });

  }

  /**
   * On hover, move the tooltip under the graph point and update the details
   * @param graphPoint
   */
  onHoverGraphPoint(graphPoint) {
    let tooltipEl = document.querySelector("#tooltip");
    tooltipEl.innerHTML = "<div>Point details</div>";

    let tipWidth = tooltipEl.clientWidth;
    let tipHeight = tooltipEl.clientHeight;

    tooltipEl.style.left = (this.margin + this.leftAxisMargin + graphPoint.xOffset - tipWidth/2 + 5)  + "px";
    tooltipEl.style.top = (this.topChartMargin + graphPoint.yOffset + tipHeight + 40) + "px";
    tooltipEl.style.opacity = 0.85;
  }

  /**
   * On hover out, hide the tooltip
   * @param graphPoint
   */
  onHoverOffGraphPoint(graphPoint) {
    let tooltipEl = document.querySelector("#tooltip");
    tooltipEl.style.left = -5000;
    tooltipEl.style.opacity = 0;
  }

  getXOffsetOrZeroIfNull(point) {
    if (point) {
      return point.xOffset;
    } else {
      return 0;
    }
  }

  /**
   * Change the style of the graph point based on if its closed or not
   * @param status
   * @returns {string}
   */
  getGraphPointStyleBasedOnStatus(status) {
    if (status === "CLOSED") {
      return "graphPointReviewed";
    } else {
      return "graphPoint";
    }
  }

  /**
   * Change the style of the X based on if the ooc graph point has been closed or not
   * @param status
   * @returns {string}
   */
  getXSizeBasedOnReviewed(status) {
    if (status === "CLOSED") {
      return "smallX";
    } else {
      return "bigX";
    }
  }

  /**
   * Translate the duration of a graph point to an offset position within the data field
   * @param dataScaleFn
   * @param durationInSeconds
   */
  translateDurationToOffset(dataScaleFn, durationInSeconds) {
    let offset = dataScaleFn(durationInSeconds);

    let pointOffset = this.boxHeight - this.zeroLineMargin - offset;
    if (pointOffset < 0) {
      pointOffset = 0;
    }
    return pointOffset;
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
