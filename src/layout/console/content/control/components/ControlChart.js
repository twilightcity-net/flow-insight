import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../UtilRenderer";
import {RendererEventFactory} from "../../../../../events/RendererEventFactory";
import {BaseClient} from "../../../../../clients/BaseClient";
import {MemberClient} from "../../../../../clients/MemberClient";

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
    this.troublePoints = [];
    this.forceHighlightCircuit = null
  }

  static FIFTY_MIN_OOC_LIMIT_IN_SECONDS = 3000;
  static MARKED_STR = "marked";
  static learningCircuitDtoStr = "learningCircuitDto";


  /**
   * Initially when we get the first set of props, display our chart data.
   */
  componentDidMount() {
    if (this.props.chartDto) {
      this.displayChart(
        this.props.chartDto
      );
    }

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.troubleRowHoverListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_TROUBLE_ROW_HOVER,
        this,
        this.onTroubleRowHover
      );

  }

  /**
   * On model updates, redraw the chart
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.weekOffset !== this.props.weekOffset) {
      this.displayChart(this.props.chartDto);
    }
  }

  /**
   * Unregister stuff before we unmount
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
    this.troubleRowHoverListener.clear();
  }

  /**
   * When we get a new talk message, if its for a data point represented on the screen,
   * such as for a circuit state update, or a status mark, change the color of the point accordingly.
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    if (arg.messageType === BaseClient.MessageTypes.WTF_STATUS_UPDATE) {
      this.handleWtfStatusUpdateMessage(arg);
    }
  };

  /**
   * When we hover over a troubleshoot row, we get a notification so we can highlight
   * the specific point
   * @param event
   * @param arg
   */
  onTroubleRowHover = (event, arg) => {
    if (this.forceHighlightCircuit) {
      this.unhighlightPoint(this.forceHighlightCircuit);
    }

    if (arg.circuitName && this.hasMatchingTroublePoint(arg.circuitName)) {
      this.highlightPoint(arg.circuitName);
      this.forceHighlightCircuit = arg.circuitName;
    }

  }

  handleWtfStatusUpdateMessage(arg) {
    let data = arg.data,
      circuit = data[ControlChart.learningCircuitDtoStr];

    if (this.updateTroublePoints(circuit)) {
      this.redrawChart();
    }
  }

  /**
   * Returns true if the current trouble point list has a matching point
   * @param circuitName
   * @returns {boolean}
   */
  hasMatchingTroublePoint(circuitName) {
    let hasMatch = false;
    this.troublePoints.forEach((point) => {
      if (point.circuitName === circuitName) {
        hasMatch = true;
        return true;
      }
    });
    return hasMatch;
  }

  /**
   * Update troubleshooting points and return true if this circuit is updated
   * @param circuit
   */
  updateTroublePoints(circuit) {
    let hasUpdate = false;
    this.troublePoints.forEach((point) => {
       if (point.circuitName === circuit.circuitName) {
         point.circuitState = circuit.circuitState;

         if (this.hasMarkForMe(circuit.memberMarksForClose)) {
           point.isMarked = true;
         }

         hasUpdate = true;
         return true;
       }
    });
    return hasUpdate;

  }

  /**
   * Return true if the list has a mark for me
   * @param marksList
   */
  hasMarkForMe(marksList) {
    let hasMarkForMe = false;
    if (marksList) {
      marksList.forEach((markId) => {
         if (markId === MemberClient.me.id) {
           hasMarkForMe = true;
           return true;
         }
      });
    }
    return hasMarkForMe;
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

    let rows = chartDto.chartSeries.rowsOfPaddedCells;

    this.troublePoints = this.createTroubleGraphPoints(rows);

    this.redrawChart();
  }

  redrawChart() {
    let currentWeek = this.props.chartDto.position;

    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

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

    this.drawTicksForPoints(chartGroup, this.troublePoints);
    this.drawLinesConnectingPoints(chartGroup, this.troublePoints);
    this.drawPoints(chartGroup, this.troublePoints);
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
        circuitName: UtilRenderer.getCircuitName(row[2].trim()),
        durationInSeconds: parseInt(row[3].trim(), 10),
        coords: row[4].trim(),
        solvedTime: row[5].trim(),
        retroTime: row[6].trim(),
        status: row[7].trim(),
        description: row[8].trim(),
        isMarked: this.isMarked(row[9].trim()),
        hasRetro: this.hasRetro(row[6].trim()),
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
   * Returns true if the marked string is "marked"
   * @param markedStr
   */
  isMarked(markedStr) {
     return markedStr === ControlChart.MARKED_STR;
  }

  /**
   * Returns true if the retro start is populated
   * @param retroStart
   */
  hasRetro(retroStart) {
    return retroStart !== "";
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

    //draw the points for the non-ooc points
    points.forEach((point, i) => {
      if (point.durationInSeconds < ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS) {
        chartGroup.append("circle")
          .attr("id", point.circuitName + "-point")
          .attr("class", this.getGraphPointStyleBasedOnStatus(point.status, point.isMarked))
          .attr("cx", this.margin + this.leftAxisMargin + point.xOffset)
          .attr("cy", this.topChartMargin + point.yOffset)
          .attr("r", 4);
      }
    });

    //draw the Xs for the ooc points
    points.forEach((point, i) => {
      if (point.durationInSeconds >= ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS) {
        chartGroup.append("text")
          .attr("id", point.circuitName + "-ooc")
          .attr("class", this.getXSizeBasedOnReviewed(point.status, point.isMarked))
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
      .attr("class", (d) => this.getTargetStyleBasedOnStatus(d.status, d.isMarked, d.hasRetro))
      .attr("cx", (d, i) => this.margin + this.leftAxisMargin + d.xOffset)
      .attr("cy", (d) => this.topChartMargin + d.yOffset)
      .attr("r", 10)
    .on("click", function (event, d) {
      that.onClickGraphPoint(d);
    })
    .on("mouseover", function (event, d) {
      that.highlightPoint(d.circuitName);
      that.onHoverGraphPoint(d);
    })
    .on("mouseout", function (event, d) {
      that.unhighlightPoint(d.circuitName);
      that.onHoverOffGraphPoint(d);
    });

  }

  highlightPoint(circuitName) {
    let graphPoint = document.getElementById(circuitName + "-point");
    if (graphPoint) {
      graphPoint.classList.add("highlight");
    }

    let targetPoint = document.getElementById(circuitName + "-target");
    if (targetPoint) {
      targetPoint.classList.add("highlight");
    }

    let xPoint = document.getElementById(circuitName + "-ooc");
    if (xPoint) {
      xPoint.classList.add("highlight");
    }
  }

  unhighlightPoint(circuitName) {
    let graphPoint = document.getElementById(circuitName + "-point");
    if (graphPoint) {
      graphPoint.classList.remove("highlight");
    }

    let targetPoint = document.getElementById(circuitName + "-target");
    if (targetPoint) {
      targetPoint.classList.remove("highlight");
    }

    let xPoint = document.getElementById(circuitName + "-ooc");
    if (xPoint) {
      xPoint.classList.remove("highlight");
    }
  }

  /**
   * Handler for when clicking a graph point navigate to retro for the point
   * @param graphPoint
   */
  onClickGraphPoint(graphPoint) {
    console.log("Clicked point! "+graphPoint.circuitName);

    this.props.onClickGraphPoint(graphPoint);
  }

  /**
   * On hover, move the tooltip under the graph point and update the details
   * @param graphPoint
   */
  onHoverGraphPoint(graphPoint) {
    let tooltipEl = document.querySelector("#tooltip");

    let html = "";
    html +=
      "<div class='tipBox' ><span class='fullName'>" +
      graphPoint.fullName + " </span><span class='duration'>" +
      UtilRenderer.getWtfTimerStringFromTimeDurationSeconds(graphPoint.durationInSeconds) +
      "</span>\n";
    html +=
      "<div class='description'>" +
      graphPoint.description +
      "</div>";
    html +=
      "<div><hr class='divider'/><span class='date'>" +
      UtilRenderer.getSimpleDateTimeFromUtc(graphPoint.solvedTime) +
      "</span><span class='"+this.getClassForCircuitStatus(graphPoint)+"'>" +
      this.getCircuitStatusText(graphPoint) +
      "</span></div></div>";

    tooltipEl.innerHTML = html;

    this.updateTipStylesBasedOnPosition(tooltipEl, graphPoint);

    this.props.onHoverGraphPoint(graphPoint);
  }

  /**
   * Gets the friendly circuit status text that corresponds to the visual indicators
   * to make it easier for the user to make sense of the state
   * @param graphPoint
   * @returns {string}
   */
  getCircuitStatusText(graphPoint) {

    const isOverThreshold = graphPoint.durationInSeconds >= ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS;
    const isClosed = graphPoint.status === "CLOSED" || graphPoint.isMarked;
    const hasRetro = graphPoint.hasRetro;

    let text = "";

    if (isOverThreshold) {
      if ( !hasRetro && !isClosed ) {
        text = "NEEDS REVIEW";
      } else if (hasRetro && !isClosed) {
        text = "RETRO IN PROGRESS";
      } else if (hasRetro && isClosed) {
        text = "REVIEWED";
      } else if (isClosed) {
        text = "CLOSED";
      }
    } else {
      if ( !hasRetro && !isClosed ) {
        text = "SOLVED";
      } else if (hasRetro && !isClosed) {
        text = "RETRO IN PROGRESS";
      } else if (hasRetro && isClosed) {
        text = "REVIEWED";
      } else if (isClosed) {
        text = "CLOSED";
      }
    }
    return text;

  }

  /**
   * Gets the class that corresponds to the needed coloring for our status text
   * Overthreshold things we want to make red when a review is needed
   * @param graphPoint
   * @returns {string}
   */
  getClassForCircuitStatus(graphPoint) {

    const isOverThreshold = graphPoint.durationInSeconds >= ControlChart.FIFTY_MIN_OOC_LIMIT_IN_SECONDS;
    const isClosed = graphPoint.status === "CLOSED" || graphPoint.isMarked;
    const hasRetro = graphPoint.hasRetro;

    let className = 'state';
    if (isClosed) {
      className += " closed";
    } else if (hasRetro) {
      className += " retro";
    } else if (isOverThreshold) {
      className += " trouble";
    }
    return className;
  }


  /**
   * Update whether the tip goes above or below the graph point, and the associated styles
   * based on the tip placement
   * @param tooltipEl
   * @param graphPoint
   */
  updateTipStylesBasedOnPosition(tooltipEl, graphPoint) {
    const tipAboveBelowThreshold = 120;

    if (graphPoint.yOffset > tipAboveBelowThreshold) {
      tooltipEl.classList.remove("popuptop");
      tooltipEl.classList.add("popuptop");

      let tipWidth = tooltipEl.clientWidth;
      let tipHeight = tooltipEl.clientHeight;

      tooltipEl.style.left = (this.margin + this.leftAxisMargin + graphPoint.xOffset - tipWidth/2 + 5)  + "px";
      tooltipEl.style.top = (this.topChartMargin + graphPoint.yOffset - tipHeight + 20) + "px";
      tooltipEl.style.opacity = 0.85;

    } else {
      let tipWidth = tooltipEl.clientWidth;
      let tipHeight = 80;

      tooltipEl.classList.remove("popuptop");

      tooltipEl.style.left = (this.margin + this.leftAxisMargin + graphPoint.xOffset - tipWidth/2 + 5)  + "px";
      tooltipEl.style.top = (this.topChartMargin + graphPoint.yOffset + tipHeight + 5) + "px";
      tooltipEl.style.opacity = 0.85;
    }
  }

  /**
   * On hover out, hide the tooltip
   * @param graphPoint
   */
  onHoverOffGraphPoint(graphPoint) {
    let tooltipEl = document.querySelector("#tooltip");
    tooltipEl.style.left = "-5000px";

    this.props.onHoverOffGraphPoint();
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
   * @param isMarked
   * @returns {string}
   */
  getGraphPointStyleBasedOnStatus(status, isMarked) {
    if (status === "CLOSED" || isMarked) {
      return "graphPointReviewed";
    } else {
      return "graphPoint";
    }
  }

  /**
   * Change the style of the target based on if its reviewed or not
   * @param status
   * @param isMarked
   * @param hasRetro
   * @returns {string}
   */
  getTargetStyleBasedOnStatus(status, isMarked, hasRetro) {
    let classNames = "";
    if (status === "CLOSED" || isMarked) {
      classNames += "graphPointTarget reviewed";
    } else {
      classNames += "graphPointTarget";
    }
    if (hasRetro) {
      classNames += " hasRetro";
    }
    return classNames;
  }

  /**
   * Change the style of the X based on if the ooc graph point has been closed or not
   * @param status
   * @param isMarked
   * @returns {string}
   */
  getXSizeBasedOnReviewed(status, isMarked) {
    if (status === "CLOSED" || isMarked) {
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
