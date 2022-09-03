import React, { Component } from "react";
import { DimensionController } from "../../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../../UtilRenderer";

/**
 * this is the gui component that displays the IFM chart
 */
export default class LatestWeekChart extends Component {
  /**
   * builds the IFM chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[LatestWeekChart]";
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

  /**
   * Display the latest week chart on the screen
   * @param chart
   */
  displayChart(chart) {
    this.margin = 30;
    this.topMargin = 40;
    this.topChartMargin = 70;
    this.tooltipPositionPercent = 0.7;
    this.height = DimensionController.getFlowPanelHeight();
    this.width = DimensionController.getFlowPanelWidth();
    this.cellMargin = 10;
    this.weekendExtraMargin = 20;

    this.cellSize = this.calculateCellSizeBasedOnScreen(this.width, this.height);


    this.legendOffsetForCloseAction = 0;

    //TODO our intro screen we're going to want to have this X button,
    //only if we're opening as the splash open screen, otherwise we will view this
    //when we click on the chart button.
    if (this.props.hasRoomForClose) {
      this.legendOffsetForCloseAction = 30;
    }


    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

    let data = chart.chartSeries.rowsOfPaddedCells;
    if (data.length === 0) {
      //empty chart
      return;
    }

    let dailyRows = this.mapToDailyRows(data);

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", this.height + "px");

    const chartGroup = svg.append("g").attr("class", "ifm");

    this.drawTitle(chartGroup);
    this.drawBoxes(dailyRows, chartGroup);
    this.drawMomentumBoxes(dailyRows, chartGroup);
    this.drawConfusionBoxes(dailyRows, chartGroup);
    this.drawWeekdayLabels(dailyRows, chartGroup);
    this.drawDateLabels(dailyRows, chartGroup);
    this.drawLegend(svg, chartGroup);
  }

  /**
   * Draw the MTWThFSS Labels
   * @param dailyRows
   * @param chartGroup
   */
  drawWeekdayLabels(dailyRows, chartGroup) {
    chartGroup
      .selectAll("weekday")
      .data(dailyRows)
      .enter()
      .append("text")
      .attr("class", "weekdayLabel")
      .attr(
        "x",
        (d) => this.getXOffsetForDayIndex(d.dayIndex) + (this.cellSize / 2)
      )
      .attr(
        "y",
        (d) => this.topMargin + this.topChartMargin - 10
      )
      .attr("text-anchor", "middle")
      .text((d) => this.formatDay(d.dayIndex));
  }

  /**
   * Draw the MTWThFSS Labels
   * @param dailyRows
   * @param chartGroup
   */
  drawDateLabels(dailyRows, chartGroup) {
    chartGroup
      .selectAll("date")
      .data(dailyRows)
      .enter()
      .append("text")
      .attr("class", "dateLabel")
      .attr(
        "x",
        (d) => this.getXOffsetForDayIndex(d.dayIndex) + (this.cellSize / 2)
      )
      .attr(
        "y",
        (d) => this.topMargin + this.topChartMargin + this.cellSize + 10
      )
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .text((d) =>  UtilRenderer.getDateString(d.calDate));
  }

  /**
   * Divide up the available screen width to show the boxes at their max size
   * @param width
   * @param height
   * @returns {number}
   */
  calculateCellSizeBasedOnScreen(width, height) {
    let chartArea = Math.round(width * 1);
    console.log(chartArea);
    let size = Math.round((chartArea - this.weekendExtraMargin - this.margin*2)/ 7 - this.cellMargin);
    console.log(size);
    return size;
  }

  /**
   * Draw the dashboard title
   * @param chartGroup
   */
  drawTitle(chartGroup) {
    chartGroup
      .append("text")
      .attr("class", "title")
      .attr("x", this.margin)
      .attr("y", this.topMargin)
      .attr("text-anchor", "start")
      .text("This Week's Flow");
  }


  /**
   * Draw the flow states legend at the bottom of the screen
   * @param svg
   * @param chartGroup
   */
  drawLegend(svg, chartGroup) {

    let legendBoxWidth = 300;
    let legendBoxHeight = 100;
    let barsize = 100;
    let margin = 10;

    this.drawLegendBoxAndLabels(chartGroup, legendBoxWidth, legendBoxHeight);
    this.setupMomentumGradientDef(svg);

    chartGroup
      .append("rect")
      .attr("fill", "#ffffff")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x", this.width - this.margin - barsize - 10)
      .attr("y", this.height - legendBoxHeight + 15)
      .attr("width", barsize)
      .attr("height", 10);

    chartGroup
      .append("rect")
      .attr("fill", "url(#momentumGradient)")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x", this.width - this.margin - barsize - 10)
      .attr("y", this.height - legendBoxHeight + 35)
      .attr("width", barsize)
      .attr("height", 10);

    chartGroup
      .append("rect")
      .attr("fill", "#FF2C36")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x", this.width - this.margin - barsize - 10)
      .attr("y", this.height - legendBoxHeight + 55)
      .attr("width", barsize)
      .attr("height", 10);

  }

  /**
   * Add the gradient for momentum to the svg defs section
   * @param svg
   */
  setupMomentumGradientDef(svg) {
    var interp = d3
      .scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

    let defs = svg.append("defs");

    let gradient = defs
      .append("linearGradient")
      .attr("id", "momentumGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", interp(0));

    gradient
      .append("stop")
      .attr("offset", "20%")
      .attr("stop-color", interp(0.2));

    gradient
      .append("stop")
      .attr("offset", "40%")
      .attr("stop-color", interp(0.4));

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", interp(1));
  }

  /**
   * Draw the legend box and text labels
   * @param chartGroup
   * @param legendBoxWidth
   * @param legendBoxHeight
   */
  drawLegendBoxAndLabels(chartGroup, legendBoxWidth, legendBoxHeight) {
    //legend box
    chartGroup
      .append("rect")
      .attr("stroke", "#333333")
      .attr("fill", "rgba(0,0,0,0)")
      .attr("x", this.width - this.margin - legendBoxWidth)
      .attr("y", this.height - this.margin - legendBoxHeight + 10)
      .attr("width", legendBoxWidth)
      .attr("height", legendBoxHeight)
      .attr("rx", 10);

    //legend title
    chartGroup
      .append("text")
      .attr("x", this.width - this.margin - legendBoxWidth/2)
      .attr("y", this.height - legendBoxHeight)
      .attr("text-anchor", "middle")
      .attr("class", "axisHeader")
      .text("Flow States");

    //input state
    chartGroup
      .append("text")
      .attr("x", this.width - this.margin - legendBoxWidth + 10)
      .attr("y", this.height - legendBoxHeight + 20)
      .attr("text-anchor", "start")
      .attr("class", "axisLabel")
      .text("Input:");

    //output state
    chartGroup
      .append("text")
      .attr("x", this.width - this.margin - legendBoxWidth + 10)
      .attr("y", this.height - legendBoxHeight + 40)
      .attr("text-anchor", "start")
      .attr("class", "axisLabel")
      .text("Output/Momentum:");

    //confusion state
    chartGroup
      .append("text")
      .attr("x", this.width - this.margin - legendBoxWidth + 10)
      .attr("y", this.height - legendBoxHeight + 60)
      .attr("text-anchor", "start")
      .attr("class", "axisLabel")
      .text("Confusion:");
  }

  /**
   * Convert our raw chart data to an easier to use format
   * with position calculations already figured out, we've got 7 days of the week always M through S
   * @param chartData
   */
  mapToDailyRows(chartData) {
    let dailyRows = [];

    for (let i = 0; i < chartData.length; i++) {
      const row = chartData[i];
      const dailyRow = {};
      dailyRow.coords = row[0].trim();

      dailyRow.calDate = new Date(row[1].trim());
      dailyRow.dayIndex = this.dayIndex(dailyRow.calDate.getUTCDay());
      dailyRow.duration = parseInt(row[2].trim(), 10);
      dailyRow.confusionPercent = parseInt(row[4].trim(), 10) / 100;
      dailyRow.momentum = parseInt(row[8].trim(), 10);

      dailyRows.push(dailyRow);
    }

    console.log(dailyRows);

    return dailyRows;
  }

  /**
   * Convert the day index to be zero based (instead of the UTC date that starts at 1)
   * @param i
   * @returns {number}
   */
  dayIndex = (i) => (i + 6) % 7;

  /**
   * Get the letter for the day of the week
   * @param i
   * @returns {*}
   */
  formatDay = (i) => "MTWTFSS"[i];

  /**
   * Draw the boxes for the week days
   * @param dailyRows
   * @param chartGroup
   */
  drawBoxes(dailyRows, chartGroup) {
    chartGroup
      .selectAll("box")
      .data(dailyRows)
      .enter()
      .append("rect")
      .attr("id", (d) => d.coords)
      .attr("class", "box")
      .attr(
        "x",
        (d) => this.getXOffsetForDayIndex(d.dayIndex)
      )
      .attr(
        "y",
        (d) => this.topMargin + this.topChartMargin
      )
      .attr("width", this.cellSize)
      .attr("height", this.cellSize)
      .attr("fill", "rgba(20, 20, 21, 0.96)")
      .attr("stroke", "#333333")
      .attr("stroke-width", 1);
  }

  /**
   * Draw the momentum visualizations as a colored box for each day of the week
   * when there is data present.
   * @param dailyRows
   * @param chartGroup
   */
  drawMomentumBoxes(dailyRows, chartGroup) {
    let mScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([0, 1]);

    var interp = d3
      .scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

    chartGroup
      .selectAll("box")
      .data(dailyRows)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d) => this.getXOffsetForDayIndex(d.dayIndex)
      )
      .attr(
        "y",
        (d) => this.topMargin + this.topChartMargin
      )
      .attr("width", (d) => d.duration > 0? this.cellSize : 0)
      .attr("height", this.cellSize)
      .attr("fill", (d) =>
        interp(mScale(d.momentum))
      )
      .attr("stroke", "#333333")
      .attr("stroke-width", 1);
  }

  /**
   * Draw the boxes for the week days
   * @param dailyRows
   * @param chartGroup
   */
  drawConfusionBoxes(dailyRows, chartGroup) {
    chartGroup
      .selectAll("box")
      .data(dailyRows)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d) => this.getXOffsetForDayIndex(d.dayIndex)
      )
      .attr(
        "y",
        (d) => this.topMargin + this.topChartMargin
          + Math.floor(this.cellSize * (1 - d.confusionPercent))
      )
      .attr("width", this.cellSize)
      .attr("height", (d) =>  Math.ceil(this.cellSize * d.confusionPercent))
      .attr("fill", "#FF2C36")
      .attr("stroke", "#333333")
      .attr("stroke-width", 1);
  }

  /**
   * Get the x offset position based on the day of the week.
   * Saturday/Sunday have an extra margin so they are logically separated from the weekdays
   * @param dayIndex
   * @returns {number}
   */
  getXOffsetForDayIndex(dayIndex) {
    let extraMargin = 0;
    if (dayIndex > 4) {
      extraMargin = this.weekendExtraMargin;
    }

    return this.margin + extraMargin + (dayIndex * (this.cellSize + this.cellMargin));
  }

  /**
   * renders the svg display of the chart with d3 support
   * These divs are populated via the displayChart() call
   * @returns {*}
   */
  render() {
    return (
      <div>
        <div id="chart" />
      </div>
    );
  }
}
