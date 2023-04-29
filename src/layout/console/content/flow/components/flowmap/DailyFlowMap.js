import React, { Component } from "react";
import { DimensionController } from "../../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../../UtilRenderer";
import FeatureToggle from "../../../../../shared/FeatureToggle";

/**
 * this is the gui component that displays the IFM chart
 */
export default class DailyFlowMap extends Component {
  /**
   * builds the IFM chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[DailyFlowMap]";
  }

  static CONFUSION = "confusion";
  static MOMENTUM = "momentum";

  static GREEN_TEST_COLOR = "green";
  static RED_TEST_COLOR = "red";

  /**
   * Initially when we get the first set of props, display our chart.
   */
  componentDidMount() {
    if (this.props.chartDto) {
      this.displayChart(
        this.props.chartDto,
        this.props.selectedCircuitName
      );
    }
    if (this.props.cursorOffset === null) {
      this.hideCursor();
    }
  }

  /**
   * If we clicked on another wtf to display a different chart, the chart may need to update.
   * If we clicked on a different wtf that was in the same task, then the wtf would need to update
   * but the chart would stay the same.  The cursor position updates also call this, when we're
   * hovering over different intentions.
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      (!prevProps.chartDto && this.props.chartDto) ||
      (prevProps.chartDto &&
        this.props.chartDto &&
        prevProps.chartDto.featureName !==
          this.props.chartDto.featureName)
    ) {
      this.displayChart(
        this.props.chartDto,
        this.props.selectedCircuitName
      );
    } else if (
      prevProps.selectedCircuitName !==
      this.props.selectedCircuitName
    ) {
      this.redrawArrow(
        this.props.chartDto,
        this.props.selectedCircuitName
      );
    }

    if (
      this.props.cursorOffset === null &&
      this.props.selectedOffset === null
    ) {
      this.hideCursor();
    } else if (
      this.props.cursorOffset === null &&
      this.props.selectedOffset
    ) {
      this.moveCursorToPosition(this.props.selectedOffset);
    } else if (
      prevProps.cursorOffset !== this.props.cursorOffset
    ) {
      this.moveCursorToPosition(this.props.cursorOffset);
    }
  }

  /**
   * Hide the intention cursor since we're not hovering over an intention
   */
  hideCursor() {
    let cursorEl = document.getElementById(
      "intention-cursor"
    );
    if (cursorEl) {
      cursorEl.style.opacity = 0;
      cursorEl.style.transform = "translate(0px, 0px)";
    }
  }

  /**
   * Move the intention cursor to a specific position in the chart timeline
   * @param offset
   */
  moveCursorToPosition(offset) {
    if (this.xScale) {
      let newPosition =
        Math.round(this.xScale(offset)) - this.margin;
      let cursorEl = document.getElementById(
        "intention-cursor"
      );
      if (cursorEl) {
        cursorEl.style.opacity = 1;
        cursorEl.style.transform =
          "translate(" + newPosition + "px, 0px)";
      }
    }
  }

  /**
   * Display the flow chart on the screen, with the selected wtf highlighted with an
   * arrow.  Repeat calls to this will redraw the whole chart
   * @param chart
   * @param selectedCircuitName
   */
  displayChart(chart, selectedCircuitName) {
    this.margin = 30;
    this.tooltipPositionPercent = 0.7;
    this.legendOffsetForCloseAction = 0;
    let svgHeight = DimensionController.getFullRightPanelHeight() - 200;
    this.chartHeight = svgHeight - 2 * this.margin;
    this.browserBarHeightAdjust = DimensionController.getBrowserBarHeight();
    this.width = DimensionController.getFullRightPanelWidth();

    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

    if (this.isChartEmpty(chart)) {
      //empty chart
      return;
    }

    let rawData = chart.chartSeries.rowsOfPaddedCells;
    let chartRows = this.transformIntoChartRows(rawData);
    let xMinMax = this.createMinMaxDataRange(chartRows);

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", svgHeight + "px");

    this.xScale = d3
      .scaleLinear()
      .domain([xMinMax[0], xMinMax[1]])
      .range([this.margin, this.width - this.margin]);

    this.yScale = d3
      .scaleLinear()
      .domain([100, 0])
      .range([this.margin, this.chartHeight]);


    let barWidthByCoordsMap = this.createBarWidthByCoordsMap(chartRows, this.xScale);
    let offsetMap = this.createOffsetMap(chartRows, this.xScale);
    let tileLocationMap = this.createTileLocationDataMap(chart);
    let tileWtfMap = this.createTileWtfDataMap(chart);
    let tileExecMap = this.createTileExecDetailsMap(chart);
    let taskSwitchMap = this.createTaskSwitchMap(chart);
    let dataBreakMap = this.createDataBreakMap(chart);

    const chartGroup = svg.append("g").attr("class", "ifm");

    var momentumColorScale = this.createMomentumColorScale();
    let bars = this.createBars(chartGroup, chartRows, momentumColorScale);
    this.addBarActivityTooltip(
      bars,
      this,
      barWidthByCoordsMap,
      tileLocationMap,
      tileWtfMap
    );

    this.addDataBreakLines(
      chart,
      chartGroup,
      taskSwitchMap,
      dataBreakMap
    );

    //this.addDataBreakBars(chart, chartGroup, dataBreakMap);

    this.createInvisibleBoundingBox(chartGroup);

    this.createWtfArrow(
      chart,
      chartGroup,
      barWidthByCoordsMap,
      offsetMap,
      selectedCircuitName
    );

    //exec dots should be on top of the invis box so that exec tips turn on, and bar tips turn off
    this.addExecDots(
      chart,
      chartGroup,
      barWidthByCoordsMap,
      tileExecMap
    );
    this.addIntentionCursor(chartGroup, xMinMax);

    this.createTimeAxis(chartGroup, xMinMax, chartRows);
    this.createLegend(svg, chartGroup, momentumColorScale);
    this.createTitle(chart, chartGroup);
  }

  createMinMaxDataRange(chartRows) {
    let xMinMax = d3.extent(chartRows, function (d) {
      return d.offset;
    });
    //the max will be highest offset + duration
    xMinMax[1] = xMinMax[1] + chartRows[chartRows.length - 1].duration;

    return xMinMax;
  }

  createMomentumColorScale() {
   return d3
      .scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);
  }

  isChartEmpty(chart) {
    return (!chart || chart.chartSeries.rowsOfPaddedCells.length === 0);
  }

  /**
   * Transform the raw data into property chart rows
   * @param rawData
   */
  transformIntoChartRows(rawData) {
    console.log(rawData);

    let chartRows = [];

    for( let rawRow of rawData) {
      const chartRow = {};
      chartRow.coords = rawRow[0].trim();
      chartRow.time = rawRow[1].trim();
      chartRow.duration = parseInt(rawRow[2].trim(), 10);
      chartRow.offset = parseInt(rawRow[3].trim(), 10);
      chartRow.percentConfusion = parseInt(rawRow[4].trim(), 10);
      chartRow.momentum = parseInt(rawRow[8].trim(), 10);

      chartRows.push(chartRow);
    }

    console.log(chartRows);

    return chartRows;

  }

  /**
   * If we only need to redraw the wtf arrow and the chart is the same,
   * can call this alternative top level method to update the display
   * @param chart
   * @param selectedCircuitName
   */
  redrawArrow(chart, selectedCircuitName) {
    let chartGroup = d3.select(".ifm");

    let data = chart.chartSeries.rowsOfPaddedCells;
    let barWidthByCoordsMap =
      this.createBarWidthByCoordsMap(data, this.xScale);
    let offsetMap = this.createOffsetMap(data, this.xScale);

    this.createWtfArrow(
      chart,
      chartGroup,
      barWidthByCoordsMap,
      offsetMap,
      selectedCircuitName
    );
  }

  /**
   * Draw the wtf arrow in the location for the wtf
   * @param chart
   * @param chartGroup
   * @param barWidthByCoordsMap
   * @param offsetMap
   * @param selectedCircuitName
   */
  createWtfArrow(
    chart,
    chartGroup,
    barWidthByCoordsMap,
    offsetMap,
    selectedCircuitName
  ) {
    if (!selectedCircuitName) {
      let arrowGrpEl = document.getElementById("wtfarrow");
      if (arrowGrpEl) {
        arrowGrpEl.innerHTML = "";
      }
      return;
    }

    let wtfData =
      chart.eventSeriesByType["@flow/wtf"]
        .rowsOfPaddedCells;

    let selectedCircuitRow = this.findSelectedCircuit(
      wtfData,
      selectedCircuitName
    );
    let coords = selectedCircuitRow[0].trim();

    let offset = offsetMap[coords];
    let barWidth = barWidthByCoordsMap[coords];
    let midpoint = offset + barWidth / 2;

    let arrowHeight = 10;
    let arrowWidth = 20;
    let arrowBarWidth = 10;
    let arrowBarHeight = 22;
    let topMargin = 3;

    let points =
      midpoint -
      arrowWidth / 2 +
      "," +
      (this.chartHeight + topMargin + arrowHeight) +
      " " +
      midpoint +
      "," +
      (this.chartHeight + topMargin) +
      " " +
      (midpoint + arrowWidth / 2) +
      "," +
      (this.chartHeight + topMargin + arrowHeight);

    let arrowGrpEl = document.getElementById("wtfarrow");
    let arrowGrp;
    if (arrowGrpEl) {
      arrowGrpEl.innerHTML = "";
      arrowGrp = d3.select("#wtfarrow");
    } else {
      arrowGrp = chartGroup
        .append("g")
        .attr("id", "wtfarrow");
    }

    arrowGrp
      .append("polygon")
      .attr("points", points)
      .attr("class", "arrow");

    arrowGrp
      .append("rect")
      .attr("x", midpoint - arrowBarWidth / 2)
      .attr("y", this.chartHeight + topMargin + arrowHeight)
      .attr("width", arrowBarWidth)
      .attr("height", arrowBarHeight)
      .attr("class", "arrow");
  }

  /**
   * Find the wtf row from the chart data that corresponds to the selected wtf passed in
   * @param wtfData
   * @param selectedCircuitName
   * @returns {*}
   */
  findSelectedCircuit(wtfData, selectedCircuitName) {
    let linkToFind = "/wtf/" + selectedCircuitName;
    for (let i = 0; i < wtfData.length; i++) {
      let circuitLink = wtfData[i][3].trim();
      if (circuitLink === linkToFind) {
        return wtfData[i];
      }
    }
    return wtfData[0];
  }

  createTitle(chart, chartGroup) {
    chartGroup
      .append("text")
      .attr("class", "title")
      .attr("x", this.margin)
      .attr("y", this.margin - 10)
      .attr("text-anchor", "start")
      .text(this.props.title);
  }

  /**
   * Create the bars on the chart
   * @param chartGroup
   * @param chartRows
   * @param momentumColorScale
   * @returns {*}
   */
  createBars(chartGroup, chartRows, momentumColorScale) {
    var colorScale = d3
      .scaleOrdinal()
      .domain([DailyFlowMap.CONFUSION, DailyFlowMap.MOMENTUM])
      .range(["#FF2C36", "#7846FB"]);

    let mScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([0, 1]);

    let stackGen = d3
      .stack()
      .keys([DailyFlowMap.CONFUSION, DailyFlowMap.MOMENTUM])
      .value(function (d, key) {
        if (key === DailyFlowMap.CONFUSION) {
          return d.percentConfusion;
        } else if (key === DailyFlowMap.MOMENTUM) {
          return 100 - d.percentConfusion;
        }
        return 0;
      });

    let stackedSeries = stackGen(chartRows);

    let bars = chartGroup
      .selectAll("g")
      .data(stackedSeries)
      .enter()
      .append("g")
      .attr("fill", (d) => {
        return colorScale(d.key);
      })
      .attr("class", (d) => d.key)
      .selectAll("rect")
      .data((d) => {
        return d;
      })
      .enter()
      .append("rect")
      .attr("x", (d) => this.xScale(d.data.offset))
      .attr("y", (d) => this.yScale(d[1]))
      .attr(
        "height",
        (d) => this.yScale(d[0]) - this.yScale(d[1])
      )
      .attr(
        "width",
        (d) => this.xScale(d.data.offset + d.data.duration) - this.xScale(d.data.offset) - 0.2
      )
      .attr("fill", (d) => {
        return momentumColorScale(mScale(d.data.momentum));
      });


    chartGroup
      .selectAll(".confusion rect")
      .attr("fill", (d) => {
        return colorScale(DailyFlowMap.CONFUSION);
      });

    return bars;
  }

  /**
   * Add the tooltips for the bars on the chart, which include the file activity,
   * and the wtf for the row, or say no activity when there's no file data.
   * The tooltips will position the #tooltip object, and handle hovers on both the left and right side
   * @param bars
   * @param that
   * @param barWidthByCoordsMap
   * @param tileLocationMap
   * @param tileWtfMap
   */
  addBarActivityTooltip(
    bars,
    that,
    barWidthByCoordsMap,
    tileLocationMap,
    tileWtfMap
  ) {
    bars.on("mouseover", function (event, d) {
      let html = "";

      let coords = d.data.coords;
      let date = UtilRenderer.getSimpleDateTimeFromUtc(d.data.time);
      let offset =
        that.xScale(d.data.offset) +
        that.lookupBarWidth(
          barWidthByCoordsMap,
          d.data.coords
        ) /
          2;
      let files = tileLocationMap[coords];
      let wtfs = tileWtfMap[coords];

      if (files) {
        for (let i = 0; i < files.length; i++) {
          if (files[i].isModified.trim() === "true") {
            html +=
              "<div class='modifiedfile'><span class='filename'>" +
              files[i].file +
              "</span><span class='duration'>" +
              files[i].duration +
              "</span></div>\n";
          } else {
            html +=
              "<div class='file'><span class='filename'>" +
              files[i].file +
              "</span><span class='duration'>" +
              files[i].duration +
              "</span></div>\n";
          }
        }
      }

      if (wtfs && wtfs.length > 0) {
        if (files) {
          html += "<div>&nbsp;</div>";
        }
        html +=
          "<div class='wtftip' ><span class='circuitName' id='circuitLink'>" +
          wtfs[0].circuitName +
          "</span><span class='duration'>" +
          wtfs[0].duration +
          "</span></div>\n";
        html +=
          "<div class='wtfdescription'>" +
          wtfs[0].description +
          "</div>";
      }

      if (!wtfs && !files) {
        html += "<span class='noactivity'>No file activity</span>";
      }

      html +=
        "<hr class='rule'/><div class='gtDate'>" +
        date +
        "</div>";

      if (FeatureToggle.isNeoMode) {
        html +=
          "<br/><div class='gtcoords'>" +
          coords +
          "</div>";
      }

      let tooltipEl = document.querySelector("#tooltip");
      tooltipEl.innerHTML = html;

      if (offset < that.margin + 100) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("popupleft");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth * 0.08 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
              that.chartHeight *
                that.tooltipPositionPercent +
              that.browserBarHeightAdjust +
              "px"
          )
          .style("opacity", 0.95);
      } else if (offset > that.width - that.margin - 100) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.add("popupright");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth * 0.92 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
              that.chartHeight *
                that.tooltipPositionPercent +
              that.browserBarHeightAdjust +
              "px"
          )
          .style("opacity", 0.95);
      } else {
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("chartpopup");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth / 2 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
              that.chartHeight *
                that.tooltipPositionPercent +
              that.browserBarHeightAdjust +
              "px"
          )
          .style("opacity", 0.95);
      }
    });

    d3.select("#tooltip").on(
      "mouseleave",
      function (event, d) {
        d3.select("#tooltip").style("left", "-1000px");
      }
    );
  }

  /**
   * Add bars for each of the data breaks
   * @param chart
   * @param chartGroup
   * @param dataBreakMap
   */
  addDataBreakBars(chart, chartGroup, dataBreakMap) {
      //coords, offset, time, duration

    let dataBreakBars = chartGroup
      .append("g")
      .selectAll(".breakBars")
      .data(dataBreakMap.values())
      .enter()
      .append("rect")
      .attr("x", (d) => this.xScale(d.offset))
      .attr("y", (d) => this.yScale(100))
      .attr("height", (d) => this.yScale(0) - this.yScale(100))
      .attr("width",
        (d) => this.xScale(d.offset + d.duration) - this.xScale(d.offset) - 0.2
      )
      .attr("fill", "#000000");

    let that = this;

    dataBreakBars.on("mouseover", function (event, d) {
      let offset = that.xScale(d.offset + d.duration/2);

      console.log("duration in seconds = "+ d.duration);
      let startTime = UtilRenderer.getSimpleTimeFromUtc(d.time);

      let endDateObj = UtilRenderer.getDateObjFromUtc(d.time);
      endDateObj = new Date(endDateObj.getTime() + d.duration*1000);
      let endTime = UtilRenderer.getTimeString(endDateObj);

      let html = "<div class='databreak'>Break from " + startTime + " to "+ endTime + "</div>";

      d3.select("#tooltip").html(html);

      let tooltipEl = document.querySelector("#tooltip");

      if (offset < that.margin + 100) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("popupleft");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth * 0.08 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
            that.chartHeight *
            that.tooltipPositionPercent +
            that.browserBarHeightAdjust +
            "px"
          )
          .style("opacity", 0.95);
      } else if (offset > that.width - that.margin - 100) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.add("popupright");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth * 0.92 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
            that.chartHeight *
            that.tooltipPositionPercent +
            that.browserBarHeightAdjust +
            "px"
          )
          .style("opacity", 0.95);
      } else {
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("chartpopup");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth / 2 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
            that.chartHeight *
            that.tooltipPositionPercent +
            that.browserBarHeightAdjust +
            "px"
          )
          .style("opacity", 0.95);
      }
    });

    d3.select("#tooltip").on(
      "mouseleave",
      function (event, d) {
        d3.select("#tooltip").style("left", "-1000px");
      }
    );

  }


  /**
   * Add the black lines that show where there's data breaks in the chart
   * @param chart
   * @param chartGroup
   * @param taskSwitchMap
   * @param dataBreakMap
   * @returns {*}
   */
  addDataBreakLines(chart, chartGroup, taskSwitchMap, dataBreakMap) {
    const combinedMap = this.combineDataBreakAndTaskSwitchEvents(taskSwitchMap, dataBreakMap);

    //coords, offset, clocktime, duration

    let dataBreakLines = chartGroup
      .append("g")
      .selectAll(".break")
      .data(combinedMap.values())
      .enter()
      .append("line")
      .attr("x1", (d) => this.xScale(d.offset))
      .attr("x2", (d) => this.xScale(d.offset))
      .attr("y1", this.margin)
      .attr("y2", this.chartHeight)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d) => {
        let taskSwitch = taskSwitchMap.get(d.coords);
        if (taskSwitch) {
          return "8,1";
        } else {
          return "8,0";
        }
      })
      .attr("class", "break");


    let that = this;

    dataBreakLines.on("mouseover", function (event, d) {
      let offset = that.xScale(d.offset);

      let html = "";

      if (d.time && d.duration > 0) {
        let startTime = UtilRenderer.getSimpleTimeFromUtc(d.time);

        let endDateObj = UtilRenderer.getDateObjFromUtc(d.time);
        endDateObj = new Date(endDateObj.getTime() + d.duration*1000);
        let endTime = UtilRenderer.getTimeString(endDateObj);

        html = "<div class='databreak'>Break from " + startTime + " to "+ endTime + "</div>";
      }

      let taskSwitch = taskSwitchMap.get(d.coords);
      if (taskSwitch) {
        html +=
          "<div class='databreak'><b>Task switch to " +
          taskSwitch.taskName +
          "</b></div>";
        html +=
          "<div class='databreak'>" +
          taskSwitch.taskDescription +
          "</div>";
      }

      d3.select("#tooltip").html(html);

      let tooltipEl = document.querySelector("#tooltip");

      if (offset < that.margin + 100) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("popupleft");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth * 0.08 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
              that.chartHeight *
                that.tooltipPositionPercent +
              that.browserBarHeightAdjust +
              "px"
          )
          .style("opacity", 0.95);
      } else if (offset > that.width - that.margin - 100) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.add("popupright");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth * 0.92 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
              that.chartHeight *
                that.tooltipPositionPercent +
              that.browserBarHeightAdjust +
              "px"
          )
          .style("opacity", 0.95);
      } else {
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("chartpopup");

        d3.select("#tooltip")
          .style(
            "left",
            offset - tooltipEl.clientWidth / 2 + 5 + "px"
          )
          .style(
            "top",
            that.margin +
              that.chartHeight *
                that.tooltipPositionPercent +
              that.browserBarHeightAdjust +
              "px"
          )
          .style("opacity", 0.95);
      }
    });

    d3.select("#tooltip").on(
      "mouseleave",
      function (event, d) {
        d3.select("#tooltip").style("left", "-1000px");
      }
    );

    return dataBreakLines;
  }

  /**
   * Combine the data breaks and task switch data, to make sure we've got task
   * switch lines even when there's no actual data break
   * @param taskSwitchMap
   * @param dataBreakMap
   */
  combineDataBreakAndTaskSwitchEvents(taskSwitchMap, dataBreakMap) {
    const combinedMap = new Map();

    //coords, offset, clocktime, duration

    dataBreakMap.forEach ((value, key) => {
      combinedMap.set(key, value);
    });

    for (let key of taskSwitchMap.keys()) {
      if (!dataBreakMap.get(key)) {
        const taskSwitch = taskSwitchMap.get(key);
        combinedMap.set(key, {coords: key, offset: taskSwitch.offset, duration: 0, time: ""})
      }
    }

    return combinedMap;
  }

  /**
   * Create the time axis lines that show the beginning and end of the chart times
   * @param chartGroup
   * @param xMinMax
   * @param chartRows
   */
  createTimeAxis(chartGroup, xMinMax, chartRows) {
    let startTime = UtilRenderer.getSimpleTimeFromUtc(chartRows[0].time);
    let endTime = UtilRenderer.getSimpleTimeFromUtc(chartRows[chartRows.length - 1].time);

    let grp = chartGroup.append("g").attr("class", "axis");

    grp
      .append("line")
      .attr("x1", (d) => this.xScale(xMinMax[0]))
      .attr("y1", this.margin)
      .attr("x2", (d) => this.xScale(xMinMax[0]))
      .attr("y2", this.chartHeight + 25)
      .attr("stroke", "gray")
      .attr("stroke-width", 1);

    grp
      .append("text")
      .attr("x", this.xScale(xMinMax[0]))
      .attr("y", this.chartHeight + 42)
      .attr("text-anchor", "middle")
      .attr("class", "axisLabel")
      .text(startTime);

    grp
      .append("line")
      .attr("x1", (d) => this.xScale(xMinMax[1]))
      .attr("y1", this.margin)
      .attr("x2", (d) => this.xScale(xMinMax[1]))
      .attr("y2", this.chartHeight + 25)
      .attr("stroke", "gray")
      .attr("stroke-width", 1);

    grp
      .append("text")
      .attr("x", this.xScale(xMinMax[1]))
      .attr("y", this.chartHeight + 42)
      .attr("text-anchor", "middle")
      .attr("class", "axisLabel")
      .text(endTime);
  }

  /**
   * Create the legend that shows the confusion and momentum meanings
   * @param svg
   * @param chartGroup
   * @param momentumColorScale
   */
  createLegend(svg, chartGroup, momentumColorScale) {
    let barsize = 100;
    let margin = 10;
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
      .attr("stop-color", momentumColorScale(0));

    gradient
      .append("stop")
      .attr("offset", "20%")
      .attr("stop-color", momentumColorScale(0.2));

    gradient
      .append("stop")
      .attr("offset", "40%")
      .attr("stop-color", momentumColorScale(0.4));

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", momentumColorScale(1));

    chartGroup
      .append("rect")
      .attr("fill", "url(#momentumGradient)")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr(
        "x",
        this.width -
          this.margin -
          barsize -
          this.legendOffsetForCloseAction
      )
      .attr("y", 10)
      .attr("width", barsize)
      .attr("height", 10);

    chartGroup
      .append("text")
      .attr(
        "x",
        this.width -
          this.margin -
          barsize -
          margin -
          this.legendOffsetForCloseAction
      )
      .attr("y", 19)
      .attr("text-anchor", "end")
      .attr("class", "axisLabel")
      .text("Momentum:");

    chartGroup
      .append("rect")
      .attr("fill", "#FF2C36")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr(
        "x",
        this.width -
          this.margin -
          barsize -
          margin -
          90 -
          this.legendOffsetForCloseAction
      )
      .attr("y", 10)
      .attr("width", 10)
      .attr("height", 10);

    chartGroup
      .append("text")
      .attr(
        "x",
        this.width -
          this.margin -
          barsize -
          margin * 2 -
          90 -
          this.legendOffsetForCloseAction
      )
      .attr("y", 19)
      .attr("text-anchor", "end")
      .attr("class", "axisLabel")
      .text("Confusion:");
  }

  /**
   * Draw the intention cursor bar
   * @param chartGroup
   * @param xMinMax
   */
  addIntentionCursor(chartGroup, xMinMax) {
    chartGroup
      .append("line")
      .attr("x1", Math.round(this.xScale(xMinMax[0])))
      .attr("x2", Math.round(this.xScale(xMinMax[0])))
      .attr("y1", this.margin - 10)
      .attr("y2", this.chartHeight + 10)
      .attr("stroke", "#7f0")
      .attr("stroke-width", 2)
      .attr("id", "intention-cursor");

    let cursorEl = document.getElementById(
      "intention-cursor"
    );
    cursorEl.style.transition = "1s ease";
  }

  /**
   * Draw the dots below the bars representing execution activity, along with the exec
   * tooltips when hovering over them.
   * @param chart
   * @param chartGroup
   * @param barWidthByCoordsMap
   * @param tileExecMap
   */
  addExecDots(
    chart,
    chartGroup,
    barWidthByCoordsMap,
    tileExecMap
  ) {
    let execSummaryData = [];
    let execYMargin = 10;
    let execRadius = 3;

    if (chart.featureSeriesByType["@exec/count"]) {
      execSummaryData = chart.featureSeriesByType["@exec/count"].rowsOfPaddedCells;
    }

    let dotGrp = chartGroup.append("g");

    dotGrp
      .selectAll("execdot1")
      .data(execSummaryData)
      .enter()
      .append("circle")
      .attr("class", "execdot")
      .attr(
        "cx",
        (d) =>
          this.xScale(d[1]) +
          this.lookupBarWidth(barWidthByCoordsMap, d[0]) / 2
      )
      .attr("cy", this.chartHeight + execYMargin)
      .attr("r", execRadius)
      .attr("fill", (d) => this.getFirstDotColor(d))
      .attr("stroke-width", "1px")
      .attr("stroke", "#000");

    dotGrp
      .selectAll("execdot2")
      .data(execSummaryData)
      .enter()
      .append("circle")
      .attr("class", "execdot")
      .attr(
        "cx",
        (d) =>
          this.xScale(d[1]) +
          this.lookupBarWidth(barWidthByCoordsMap, d[0]) / 2
      )
      .attr("cy", this.chartHeight + execYMargin * 2)
      .attr("r", (d) => {
        if (this.hasSecondDot(d)) {
          return execRadius;
        } else {
          return 0;
        }
      })
      .attr("fill", (d) => this.getMidDotColor(d))
      .attr("stroke-width", "1px")
      .attr("stroke", "#000");

    dotGrp
      .selectAll("execdot3")
      .data(execSummaryData)
      .enter()
      .append("circle")
      .attr("class", "execdot")
      .attr(
        "cx",
        (d) =>
          this.xScale(d[1]) +
          this.lookupBarWidth(barWidthByCoordsMap, d[0]) / 2
      )
      .attr("cy", this.chartHeight + execYMargin * 3)
      .attr("fill", (d) => this.getThirdDotColor(d))
      .attr("stroke-width", "1px")
      .attr("stroke", "#000")
      .attr("r", (d) => {
        if (this.hasThirdDot(d)) {
          return execRadius;
        } else {
          return 0;
        }
      });

    let that = this;

    dotGrp
      .selectAll("exectrigger")
      .data(execSummaryData)
      .enter()
      .append("rect")
      .attr("x", (d) => this.xScale(d[1]))
      .attr(
        "y",
        this.chartHeight + execYMargin - execRadius
      )
      .attr("height", execYMargin * 3)
      .attr("width", (d) =>
        this.lookupBarWidth(barWidthByCoordsMap, d[0])
      )
      .attr("fill", "red")
      .attr("opacity", 0)

      .on("mouseover", function (event, d) {
        let offset = that.xScale(d[1]);

        let execDetails = tileExecMap[d[0].trim()];

        let html = "";

        if (execDetails) {
          if (execDetails[0].haystack != null) {
            html +=
              "<div class='haystack'>Haystack Size: " +
              execDetails[0].haystack +
              "</div>";
            html += "<br/><br/>";
          }

          for (let i = 0; i < execDetails.length; i++) {
            let row = execDetails[i];
            let cycles =
              parseInt(row.red, 10) +
              parseInt(row.green, 10);

            html +=
              "<div class='exectip'><span class='process'>" +
              that.truncateIfTooLong(row.exec) +
              "</span>" +
              "<span class='duration'>" +
              row.tExecTime +
              "<span> | " +
              cycles +
              " cycles | </span>" +
              "<span class='fail'>" +
              row.red +
              "</span> | " +
              "<span class='pass'>" +
              row.green +
              "</span> | " +
              "<span class='debug'>" +
              row.debug +
              "<i class='bug icon'></i></span>" +
              "</span></div>";
          }
        } else {
          console.warn(
            "No exec details found when expected for gt " +
              d[0] +
              "! "
          );
        }

        d3.select("#tooltip").html(html);

        let tooltipEl = document.querySelector("#tooltip");
        let tipWidth = tooltipEl.clientWidth;

        if (offset < that.margin + that.width / 2 - 150) {
          tooltipEl.classList.remove("chartpopup");
          tooltipEl.classList.remove("popupright");
          tooltipEl.classList.add("popupleft");

          d3.select("#tooltip")
            .style(
              "left",
              offset -
                tipWidth * 0.08 +
                5 +
                that.lookupBarWidth(
                  barWidthByCoordsMap,
                  d[0]
                ) /
                  2 +
                "px"
            )
            .style(
              "top",
              that.margin +
                that.chartHeight *
                  that.tooltipPositionPercent +
                that.browserBarHeightAdjust +
                execYMargin * 5 +
                "px"
            )
            .style("opacity", 0.95);
        } else if (
          offset >
          that.width - that.width / 2 + 150
        ) {
          tooltipEl.classList.remove("chartpopup");
          tooltipEl.classList.remove("popupleft");
          tooltipEl.classList.add("popupright");

          d3.select("#tooltip")
            .style(
              "left",
              offset -
                tipWidth * 0.92 +
                5 +
                that.lookupBarWidth(
                  barWidthByCoordsMap,
                  d[0]
                ) /
                  2 +
                "px"
            )
            .style(
              "top",
              that.margin +
                that.chartHeight *
                  that.tooltipPositionPercent +
                that.browserBarHeightAdjust +
                execYMargin * 5 +
                "px"
            )
            .style("opacity", 0.95);
        } else {
          tooltipEl.classList.remove("popupleft");
          tooltipEl.classList.remove("popupright");
          tooltipEl.classList.add("chartpopup");

          d3.select("#tooltip")
            .style(
              "left",
              offset -
                tipWidth / 2 +
                5 +
                that.lookupBarWidth(
                  barWidthByCoordsMap,
                  d[0]
                ) /
                  2 +
                "px"
            )
            .style(
              "top",
              that.margin +
                that.chartHeight *
                  that.tooltipPositionPercent +
                that.browserBarHeightAdjust +
                execYMargin * 5 +
                "px"
            )
            .style("opacity", 0.95);
        }
      });

    d3.select("#tooltip").on(
      "mouseleave",
      function (event, d) {
        d3.select("#tooltip").style("left", "-1000px");
      }
    );
  }

  truncateIfTooLong(name) {
    const tipLimit = 50;
    if (name.length < tipLimit) {
      return name;
    } else {
      return name.substr(0, tipLimit) + "...";
    }
  }

  /**
   * Create an invisible bounding box around the chart so that when we leave the chart
   * area, the mouse tooltip is turned off.  This creates significantly smoother mouse movement
   * over using mouseleave on the individual bars which makes the tooltip very blinky.
   * The tooltip will stay on and just change position, until moving over the invisible bounding box
   * turns it off.
   * @param chartGroup
   */
  createInvisibleBoundingBox(chartGroup) {
    let boundingBox = chartGroup
      .append("g")
      .attr("class", "invisBox");
    let lineSize = this.margin;
    //left line
    boundingBox
      .append("line")
      .attr("x1", this.margin / 2)
      .attr("y1", this.margin / 2)
      .attr("x2", this.margin / 2)
      .attr("y2", this.chartHeight + this.margin / 2)
      .attr("stroke-width", lineSize + "px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    //bottom line
    boundingBox
      .append("line")
      .attr("x1", this.margin / 2)
      .attr("y1", this.chartHeight + this.margin)
      .attr("x2", this.width - this.margin / 2)
      .attr("y2", this.chartHeight + this.margin)
      .attr("stroke-width", lineSize * 2 + "px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    //right line
    boundingBox
      .append("line")
      .attr("x1", this.width - this.margin / 2)
      .attr("y1", this.margin / 2)
      .attr("x2", this.width - this.margin / 2)
      .attr("y2", this.chartHeight + this.margin / 2)
      .attr("stroke-width", lineSize + "px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    //top line
    boundingBox
      .append("line")
      .attr("x1", this.margin / 2)
      .attr("y1", this.margin / 2)
      .attr("x2", this.width - this.margin / 2)
      .attr("y2", this.margin / 2)
      .attr("stroke-width", lineSize + "px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    boundingBox.on("mouseover", function (event, d) {
      d3.select("#tooltip").style("left", "-1000px");
    });

    let that = this;
    boundingBox.on("click", function (event, d) {
      that.props.onClickOffCircuit();
    });

    let el = document.getElementById("draggableBanner");
    if (el) {
      el.addEventListener("mouseover", (event) => {
        d3.select("#tooltip").style("left", "-1000px");
      });
    }

  }

  /**
   * Get the file name part from a full file path
   * @param filePath
   * @returns {string|*}
   */
  extractFileName(filePath) {
    let lastSlash = filePath.lastIndexOf("/");
    if (lastSlash > 0) {
      return filePath.substring(lastSlash + 1);
    } else {
      return filePath;
    }
  }

  /**
   * Lookup the width of a flow chart bar from a mapping by coordinates
   * @param map
   * @param coords
   * @returns {number|*}
   */
  lookupBarWidth(map, coords) {
    let barWidth = map[coords.trim()];
    if (!barWidth) {
      console.error("no bar width found!");
      return 20;
    }
    return barWidth;
  }

  /**
   * Create a map of all the offset positions for each bar by coords
   * @param chartRows
   * @param xScale
   * @returns {*}
   */
  createOffsetMap(chartRows, xScale) {
    let map = [];

    for (let i = 0; i < chartRows.length; i++) {
      let d = chartRows[i];
      map[d.coords] = xScale(d.offset);
    }
    return map;
  }

  /**
   * Create a mapping of bar widths by coordinate
   * @param chartRows
   * @param xScale
   * @returns {*}
   */
  createBarWidthByCoordsMap(chartRows, xScale) {
    let map = [];

    for (let i = 0; i < chartRows.length; i++) {
      let d = chartRows[i];
      map[d.coords] = xScale(d.offset + d.duration) - xScale(d.offset) - 0.2;
    }
    return map;
  }

  createTaskSwitchMap(chart) {
    let taskSwitchMap = new Map();
    let taskSwitchData = [];

    if (chart.eventSeriesByType["@work/task"]) {
      taskSwitchData = chart.eventSeriesByType["@work/task"].rowsOfPaddedCells;
    }

    for (let i = 0; i < taskSwitchData.length; i++) {
      let row = taskSwitchData[i];

      let coords = row[0].trim();
      let offset = parseInt(row[2].trim(), 10);
      let taskName = row[4].trim();
      let taskDescription = row[5].trim();

      let switchEvent = {
        coords: coords,
        taskName: taskName,
        taskDescription: taskDescription,
        offset: offset
      };
      taskSwitchMap.set(coords, switchEvent);
    }

    console.log("Task switch map");
    console.log(taskSwitchMap);

    return taskSwitchMap;
  }


  createDataBreakMap(chart) {

    let dataBreaksData = chart.featureSeriesByType["@nav/break"].rowsOfPaddedCells;

    //['Coords              ', 'Offset ', 'ClockTime        ', 'Duration ']

    let dataBreaksMap = new Map();

    for (let i = 0; i < dataBreaksData.length; i++) {
      let row = dataBreaksData[i];

      let coords = row[0].trim();
      let offset = parseInt(row[1].trim(), 10);
      let time = row[2].trim();
      let duration = parseInt(row[3].trim(), 10);

      let dataBreakEvent = {
        coords: coords,
        time: time,
        duration: duration,
        offset: offset
      };
      dataBreaksMap.set(coords, dataBreakEvent);
    }

    console.log("Data breaks map");
    console.log(dataBreaksMap);

    return dataBreaksMap;
  }

  /**
   * Create a mapping of execution and haystack details by coords
   * @param chart
   * @returns {*}
   */
  createTileExecDetailsMap(chart) {
    let execData = [];
    let haystackData = [];

    //optional data sets
    if (chart.featureSeriesByType["@exec/runtime"]) {
      execData = chart.featureSeriesByType["@exec/runtime"].rowsOfPaddedCells;
    }
    if (chart.eventSeriesByType["@exec/haystak"]) {
      haystackData = chart.eventSeriesByType["@exec/haystak"].rowsOfPaddedCells;
    }

    let execDetailMap = [];

    for (let i = 0; i < execData.length; i++) {
      let row = execData[i];
      let coords = row[0].trim();
      let offset = row[1].trim();
      let process = row[2].trim();
      let tExecTime = row[3].trim();
      let tHumanTime = row[4].trim();
      let red = row[5].trim();
      let green = row[6].trim();
      let debug = row[7].trim();

      let execTime = tHumanTime;
      if (!execTime) {
        execTime = tExecTime;
      }

      let execEntry = {
        exec: process,
        offset: offset,
        red: red,
        green: green,
        debug: debug,
        tExecTime: execTime,
        haystack: null,
      };

      let coordData = execDetailMap[coords];
      if (!coordData) {
        execDetailMap[coords] = [execEntry];
      } else {
        coordData.push(execEntry);
      }
    }

    for (let i = 0; i < haystackData.length; i++) {
      let row = haystackData[i];
      let coords = row[0].trim();
      let haystack = row[3].trim();

      let execForCoords = execDetailMap[coords];

      if (execForCoords) {
        execForCoords[0].haystack = haystack;
      } else {
        console.warn(
          "no execs for haystack at " + coords + "!"
        );
      }
    }

    return execDetailMap;
  }

  /**
   * Create a mapping of wtf details by coords
   * @param chart
   * @returns {*}
   */
  createTileWtfDataMap(chart) {
    let chartSeries = chart.chartSeries.rowsOfPaddedCells;
    let wtfData = [];

    //optional dataset
    if (chart.eventSeriesByType["@flow/wtf"]) {
      wtfData = chart.eventSeriesByType["@flow/wtf"].rowsOfPaddedCells;
    }

    let tileWtfMap = [];

    for (let i = 0; i < wtfData.length; i++) {
      let row = wtfData[i];
      let coords = row[0].trim();
      let circuitName = row[3].trim();
      let duration = row[4].trim();
      let description = row[5].trim();

      let wtfEntry = {
        circuitName: circuitName,
        duration: duration,
        description: description,
      };

      let coordData = tileWtfMap[coords];
      if (!coordData) {
        tileWtfMap[coords] = [wtfEntry];
      } else {
        coordData.push(wtfEntry);
      }
    }

    //add in extra entries for wtfs carrying over to additional tiles

    let lastWtf = null;

    for (let i = 0; i < chartSeries.length; i++) {
      let row = chartSeries[i];
      let coords = row[0].trim();
      let confusion = parseInt(row[4], 10);

      if (confusion > 0) {
        let wtfsForTile = tileWtfMap[coords];
        if (!wtfsForTile) {
          if (lastWtf) {
            tileWtfMap[coords] = [lastWtf];
          }
        } else {
          lastWtf = wtfsForTile[wtfsForTile.length - 1];
        }
      } else {
        lastWtf = null;
      }
    }
    return tileWtfMap;
  }

  /**
   * Create a mapping of file location activity by coords
   * @param chart
   * @returns {*}
   */
  createTileLocationDataMap(chart) {
    let locationData = [];

    if (chart.featureSeriesByType["@place/location"]) {
      locationData = chart.featureSeriesByType["@place/location"].rowsOfPaddedCells;
    }

    let tileLocationMap = [];
    //so each row, has coords, file, duration, and modified
    //so I need to combine all these by coords, first of all to prep the dataset

    for (let i = 0; i < locationData.length; i++) {
      let row = locationData[i];
      let coords = row[0].trim();
      let file = this.extractFileName(row[1].trim());
      let isModified = row[3].trim();
      let duration = row[2].trim();

      let fileEntry = {
        file: file,
        isModified: isModified,
        duration: duration,
      };
      let coordData = tileLocationMap[coords];
      if (!coordData) {
        tileLocationMap[coords] = [fileEntry];
      } else {
        coordData.push(fileEntry);
      }
    }

    return tileLocationMap;
  }

  /**
   * For the exec dots, get the color of the dot by how many red and green
   * tests there are
   * @param d
   * @returns {string}
   */
  getFirstDotColor(d) {
    let red = parseInt(d[3], 10);

    if (red > 0) {
      return DailyFlowMap.RED_TEST_COLOR;
    } else {
      return DailyFlowMap.GREEN_TEST_COLOR;
    }
  }

  /**
   * For the exec dots, get the color of the second dot by how many red and green
   * tests there are
   * @param d
   * @returns {string}
   */
  getMidDotColor(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);

    if (
      green > red ||
      (green > 0 && !this.hasThirdDot(d))
    ) {
      return DailyFlowMap.GREEN_TEST_COLOR;
    } else {
      return DailyFlowMap.RED_TEST_COLOR;
    }
  }

  /**
   * For the exec dots, get the color of the third dot by how many red and green
   * tests there are
   * @param d
   * @returns {string}
   */
  getThirdDotColor(d) {
    let green = parseInt(d[4], 10);

    if (green > 0) {
      return DailyFlowMap.GREEN_TEST_COLOR;
    } else {
      return DailyFlowMap.RED_TEST_COLOR;
    }
  }

  /**
   * If a first exec dot is displayed or not, based on whether tests exist
   * @param d
   * @returns {string}
   */
  hasFirstDot(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);
    if (red + green > 0) {
      return true;
    }
    return false;
  }

  /**
   * If a second exec dot is displayed or not, based on whether a medium number
   * of tests exist
   * @param d
   * @returns {string}
   */
  hasSecondDot(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);
    if (red + green > 2) {
      return true;
    }
    return false;
  }

  /**
   * If a third exec dot is displayed or not, based on whether lots of tests exist
   * @param d
   * @returns {string}
   */
  hasThirdDot(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);
    if (red + green > 3) {
      return true;
    }
    return false;
  }

  /**
   * If a user clicks on a tooltip at all, handle checking what the user is hovering over
   * and if we clicked on a wtf link and need to let the parent component know.
   */
  handleTooltipClick = (event) => {
    var x = event.clientX,
      y = event.clientY,
      elementMouseIsOver = document.elementFromPoint(x, y);

    if (elementMouseIsOver.id === "circuitLink") {
      this.props.onCircuitClick(
        elementMouseIsOver.innerHTML
      );
    }
  };

  /**
   * renders the svg display of the chart with d3 support
   * These divs are populated via the displayChart() call
   * @returns {*}
   */
  render() {
    return (
      <div>
        <div id="draggableBanner" />
        <div id="chart" />
        <div
          id="tooltip"
          className="chartpopup"
          onClick={this.handleTooltipClick}
        ></div>
      </div>
    );
  }
}
