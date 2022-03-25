import React, {Component} from "react";
import {DimensionController} from "../../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../../UtilRenderer";
import {Icon} from "semantic-ui-react";

/**
 * this component shows a summary of momentum flow/friction organized according to a calendar
 */
export default class MomentumFlowChart extends Component {
  /**
   * the constructor function which builds the MomentumFlowChart component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + MomentumFlowChart.name + "]";
  }

  static WEEKS = "WEEKS";
  static DAYS = "DAYS";

  /**
   * Initially when we get the first set of props, display our chart.
   */
  componentDidMount() {
    if (this.props.chartDto) {
      if (this.props.bucketSize === MomentumFlowChart.DAYS) {
        this.displayDailyChart(
          this.props.chartDto
        );
      } else if (this.props.bucketSize === MomentumFlowChart.WEEKS ) {
        this.displayWeeklyChart(
          this.props.chartDto
        );
      }
    }
  }

  /**
   * If we clicked on another chart to display, reload the chart
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.chartDto && prevProps.chartDto !== this.props.chartDto) {
      if (this.props.bucketSize === MomentumFlowChart.DAYS) {
        this.displayDailyChart(
          this.props.chartDto
        );
      } else if (this.props.bucketSize === MomentumFlowChart.WEEKS ) {
        this.displayWeeklyChart(
          this.props.chartDto
        );
      }
    }

    if (this.props.selectedRowId !== prevProps.selectedRowId) {
      this.updateBoxHighlight(this.props.chartDto, prevProps.selectedRowId, this.props.selectedRowId);
    }

  }

  /**
   * Display the momentum chart by weeks organized into blocks.  Automatically splits into multiple
   * bigger columns, when there are several years worth of data, and expands the SVG element to fit the data.
   * @param chart
   */
  displayWeeklyChart(chart) {

    let data = chart.chartSeries.rowsOfPaddedCells;
    if (data.length === 0) {
      //empty chart
      return;
    }
    //
    // let doubleRows = [];
    // for (let i = 0; i < data.length; i++) {
    //   doubleRows.push(data[i]);
    // }
    // for (let i = 0; i < data.length; i++) {
    //   doubleRows.push(data[i]);
    // }
    // for (let i = 0; i < data.length; i++) {
    //   doubleRows.push(data[i]);
    // }
    // for (let i = 0; i < data.length; i++) {
    //   doubleRows.push(data[i]);
    // }
    // for (let i = 0; i < data.length; i++) {
    //   doubleRows.push(data[i]);
    // }
    // for (let i = 0; i < data.length; i++) {
    //   doubleRows.push(data[i]);
    // }
    // data = doubleRows;

    let titleMargin = 45;
    this.leftTextMargin = 25;
    this.margin = 30;
    this.marginBetweenBoxesY = 5;
    this.marginBetweenBoxesX = 10;
    this.maxCellsPerColumn = 7;

    this.height = DimensionController.getFullRightPanelHeight() - titleMargin;
    this.width = DimensionController.getFullRightPanelWidth();

    let calRows = this.mapToBlockCalendar(data);
    let maxYearBreaks = this.getMaxYearBreaks(calRows);

    let cols = 6;
    let rows = this.getRowCount(calRows);
    let bigColumns = Math.ceil(rows / this.maxCellsPerColumn);

    let maxRowsPerColumn = this.maxCellsPerColumn;
    if (rows < this.maxCellsPerColumn) {
      maxRowsPerColumn = rows;
    }

    this.cellMargin = 2;
    this.extraWeekendMargin = 5;
    this.extraYearMargin = 20;

    let maxCellSizeX = Math.round((this.width - this.margin*2 -
      ((this.margin + this.leftTextMargin) * bigColumns)) / (cols*bigColumns)) - this.cellMargin;
    let maxCellSizeY = Math.round((this.height - this.margin*2 - maxYearBreaks*this.extraYearMargin) / maxRowsPerColumn) - this.cellMargin;

    this.cellSize = maxCellSizeX;
    if (maxCellSizeY < maxCellSizeX) {
      this.cellSize = maxCellSizeY;
    }

    let totalUsedWidth = ((this.cellSize + this.cellMargin)*6 + this.leftTextMargin + this.margin)*bigColumns - this.margin;

    //this.centeringMargin = (this.width - this.margin * 2 - totalUsedWidth)/2;
    this.centeringMargin = 0;

    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", (totalUsedWidth + this.margin*2) + "px")
      .attr("height", this.height + "px");

    this.drawWeeklyCalendarSquares(svg, this.props.bucketSize, calRows);
    this.drawWeekInBlockLabels(svg, bigColumns);

    let groupRefs = this.createRowReferences(calRows);

    this.drawBlockRowLabels(svg, groupRefs);
    this.drawYearBreakLabels(svg, groupRefs);
  }

  /**
   * Display the momentum chart by days organized into weeks. The weekends are broken apart into
   * a saturday sunday section to make the data a bit easier to read.  The SVG is always a square.
   * Expecting a max of 6 weeks to display here.
   * @param chart
   */
  displayDailyChart(chart) {

    let data = chart.chartSeries.rowsOfPaddedCells;
    if (data.length === 0) {
      //empty chart
      return;
    }

    let titleMargin = 45;
    this.leftTextMargin = 30;
    this.margin = 30;
    this.marginBetweenBoxesY = 5;
    this.marginBetweenBoxesX = 10;

    this.height = DimensionController.getFullRightPanelHeight() - titleMargin;
    this.width = 340;

    let calRows = this.mapToWeekCalendar(data);

    let cols = 7;
    let rows = this.getRowCount(calRows);

    this.cellMargin = 2;
    this.extraWeekendMargin = 5;
    let maxCellSizeX = Math.round((this.width - this.margin*2 - this.extraWeekendMargin *2 - this.leftTextMargin) / cols) - this.cellMargin;
    let maxCellSizeY = Math.round((this.height - this.margin*3.7) / rows) - this.cellMargin;

    this.cellSize = maxCellSizeX;
    if (maxCellSizeY < maxCellSizeX) {
      this.cellSize = maxCellSizeY;
    }

    let totalUsedWidth = (this.cellSize + this.cellMargin)*7 + this.leftTextMargin + this.extraWeekendMargin;

    this.centeringMargin = 12;//(this.width - this.margin * 2 - totalUsedWidth)/2;

    console.log("centering margin = "+this.centeringMargin);

    let chartDiv = document.getElementById("chart");
    chartDiv.innerHTML = "";

    this.width = (totalUsedWidth + this.margin*2);

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", this.height + "px");

    this.drawDailyCalendarSquares(svg, this.props.bucketSize, calRows);

    this.drawDayOfWeekLabels(svg);

    let groupRefs = this.createRowReferences(calRows);

    this.drawWeekRowLabels(svg, groupRefs);
    this.drawTipBox(svg)
  }


  /**
   * Update the box highlight for the selected box
   * @param chartDto
   * @param oldCoords
   * @param newCoords
   */
  updateBoxHighlight(chartDto, oldCoords, newCoords) {
    if (oldCoords) {
      let boxEl = document.getElementById(oldCoords + "-box");
      if (boxEl) {
        boxEl.classList.remove("boxHighlight");
      }
    }

    if (newCoords) {
      let boxEl = document.getElementById(newCoords + "-box");
      if (boxEl) {
        boxEl.classList.add("boxHighlight");
        this.boxDetail = this.findBoxWithMatchingCoords(chartDto, newCoords);
      } else {
        this.boxDetail = null;
      }
    } else {
      this.boxDetail = null;
    }
  }

  /**
   * Find the dataset row data corresponding to the selected grid coords
   * @param chartDto
   * @param coords
   * @returns {{hours: string, day: string}|null}
   */
  findBoxWithMatchingCoords(chartDto, coords) {
    let rows = chartDto.chartSeries.rowsOfPaddedCells;
    for (let i = 0; i < rows.length; i++) {
      let coordsOfRow = rows[i][0].trim();

      if (coordsOfRow === coords) {
        let day = UtilRenderer.getDateString(new Date(rows[i][1].trim()));
        let duration = parseInt(rows[i][2].trim(), 10);
        let friendlyDuration = UtilRenderer.getTimerString(duration);

        return {
          day: day,
          hours: friendlyDuration,
          coords: coordsOfRow
        }
      }
    }
    return null;
  }


  /**
   * Draw the tooltip box below the daily chart
   * @param svg
   */

  drawTipBox(svg) {

    let tipInset = 40;
    let tipHeight = 50;
    let tipMargin = 8;
    let tipPadding = 12;
    let textHeight = 20;

    let overallCellWidth = 7*(this.cellSize + this.cellMargin)+this.extraWeekendMargin;

    let tipBox = svg.append("g").attr("id", "tipbox").style('visibility', 'hidden');

    tipBox.append("rect")
    .attr('id', 'tipbox')
    .attr('x', this.centeringMargin + this.margin + this.leftTextMargin + tipInset)
    .attr('y', this.height - tipHeight - tipPadding)
    .attr('width', overallCellWidth - tipInset)
    .attr('height', tipHeight)
      .attr('rx', '3')
      .attr('ry', '3')
    .attr('fill', 'none')
    .attr('stroke', '#333333')

      .attr('stroke-width', 1)

    tipBox.append("text")
      .attr('id', 'tipboxDay')
      .attr("class", "tipboxTitle")
      .attr("x", this.centeringMargin + this.margin + this.leftTextMargin + overallCellWidth - tipMargin)
      .attr("y", this.height - tipHeight + tipMargin)
      .attr("text-anchor", "end")
      .text("Feb 12");

    tipBox.append("text")
      .attr('id', 'tipboxHours')
      .attr("class", "tipboxDetail")
      .attr("x", this.centeringMargin + this.margin + this.leftTextMargin + overallCellWidth - tipMargin)
      .attr("y", this.height - tipHeight + tipMargin + textHeight)
      .attr("text-anchor", "end")
      .text("Hours: 00:00");

    tipBox.append("text")
      .attr('id', 'tipboxCoords')
      .attr("class", "gtcoords")
      .attr("x", this.centeringMargin + this.margin + this.leftTextMargin + tipMargin + tipInset)
      .attr("y", this.height - tipHeight + tipMargin)
      .attr("text-anchor", "start")
      .text("gt[*]");

  }

  /**
   * Draw the main squares on the chart for the weekly momentum as weeks organized into blocks
   * @param svg
   * @param bucketSize
   * @param calRows
   */
  drawWeeklyCalendarSquares(svg, bucketSize, calRows) {
    let mScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([0, 1]);

    var interp = d3
      .scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

    let that = this;

    svg.selectAll('box')
      .data(calRows)
      .enter()
      .append('rect')
      .attr('id', (d) => (d.data[0].trim()))
      .attr('class', 'box')
      .attr('x', (d) => this.getBigColumnOffset(d.relativeRow) + this.centeringMargin + this.leftTextMargin + this.margin + (d.relativeColumn * (this.cellSize + this.cellMargin)))
      .attr('y', (d) => (this.getBigColumnYReset(d.relativeRow) + this.margin + (d.relativeRow * (this.cellSize + this.cellMargin))) + this.getExtraYearMargin(d.relativeYear))
      .attr('width', this.cellSize)
      .attr('height', this.cellSize)
      .attr('fill', (d) => interp(mScale(parseInt(d.data[8], 10))))
      .on("mouseover", function (event, d) {
        let box = document.getElementById(d.data[0].trim()+"-box");
        box.classList.add("boxHighlight");
      })
      .on("mouseout", function (event, d) {
        let coords = d.data[0].trim();

        if (coords !== that.props.selectedRowId) {
          let box = document.getElementById(coords+"-box");
          box.classList.remove("boxHighlight");
        }
      })
      .on("click", function (event, d) {
        let coords = d.data[0].trim();

       that.props.onClickSummaryBox(coords);
      })
    ;

    svg.selectAll('overlay')
      .data(calRows)
      .enter()
      .append('rect')
      .attr('class', 'boxOverlay')
      .attr('x', (d) => this.getBigColumnOffset(d.relativeRow) + this.centeringMargin + this.leftTextMargin + this.margin + (d.relativeColumn * (this.cellSize + this.cellMargin)))
      .attr('y', (d) => this.getBigColumnYReset(d.relativeRow) + this.margin + (d.relativeRow * (this.cellSize + this.cellMargin)+ this.getExtraYearMargin(d.relativeYear))
        + Math.floor(this.cellSize * (1 - parseInt(d.data[4], 10) / 100)) )
      .attr('width', this.cellSize)
      .attr('height', (d) => Math.ceil(this.cellSize * parseInt(d.data[4], 10) / 100))
      .attr('fill', "#FF2C36");

    svg.selectAll('overlayStroke')
      .data(calRows)
      .enter()
      .append('rect')
      .attr('class', 'boxOverlay')
      .attr('id', (d) => (d.data[0].trim() + "-box"))
      .attr('x', (d) => this.getBigColumnOffset(d.relativeRow) + this.centeringMargin + this.leftTextMargin + this.margin + (d.relativeColumn * (this.cellSize + this.cellMargin)))
      .attr('y', (d) => (this.getBigColumnYReset(d.relativeRow) + this.margin + (d.relativeRow * (this.cellSize + this.cellMargin))) + this.getExtraYearMargin(d.relativeYear))
      .attr('width', this.cellSize)
      .attr('height', this.cellSize)
      .attr('fill', 'none')

  }

  /**
   * Draw the main momentum squares as days organized into weeks
   * @param svg
   * @param bucketSize
   * @param calRows
   */
  drawDailyCalendarSquares(svg, bucketSize, calRows) {
    let mScale = d3
      .scaleLinear()
      .domain([0, 200])
      .range([0, 1]);

    var interp = d3
      .scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

    let that = this;

    svg.selectAll('box')
      .data(calRows)
      .enter()
      .append('rect')
      .attr('id', (d) => (d.data[0].trim()))
      .attr('class', 'box')
      .attr('x', (d) => this.centeringMargin + this.leftTextMargin + this.margin + (d.relativeColumn * (this.cellSize + this.cellMargin) + this.getExtraWeekendMargin(d.relativeColumn)))
      .attr('y', (d) => this.margin + (d.relativeRow * (this.cellSize + this.cellMargin)))
      .attr('width', this.cellSize)
      .attr('height', this.cellSize)
      .attr('fill', (d) => interp(mScale(parseInt(d.data[8], 10))))
      .on("mouseover", function (event, d) {
        let coords =  d.data[0].trim();
        let box = document.getElementById(coords + "-box");
        box.classList.add("boxHighlight");

        let tipbox = document.getElementById("tipbox");
        tipbox.style.visibility = "visible";

        let day = UtilRenderer.getDateString(new Date(d.data[1].trim()));
        let duration = parseInt(d.data[2].trim(), 10);
        let friendlyDuration = UtilRenderer.getTimerString(duration);

        let dayEl = document.getElementById("tipboxDay");
        dayEl.textContent = day;

        let hoursEl = document.getElementById("tipboxHours");
        hoursEl.textContent = "Hours: "+friendlyDuration;

        let coordsEl = document.getElementById("tipboxCoords");
        coordsEl.textContent = coords;
      })
      .on("click", function (event, d) {
        that.props.onClickBox(d.data[0].trim());
      })

      .on("mouseout", function (event, d) {
        let coords = d.data[0].trim();

        if (coords !== that.props.selectedRowId) {
          let box = document.getElementById(coords+"-box");
          box.classList.remove("boxHighlight");
        }

        if (that.props.selectedRowId && that.boxDetail) {
          let dayEl = document.getElementById("tipboxDay");
          dayEl.textContent = that.boxDetail.day;

          let hoursEl = document.getElementById("tipboxHours");
          hoursEl.textContent = "Hours: "+that.boxDetail.hours;

          let coordsEl = document.getElementById("tipboxCoords");
          coordsEl.textContent = that.boxDetail.coords;

        } else {
          let tipbox = document.getElementById("tipbox");
          tipbox.style.visibility = "hidden";
        }

      });

    svg.selectAll('overlay')
      .data(calRows)
      .enter()
      .append('rect')
      .attr('class', 'boxOverlay')
      .attr('x', (d) => this.centeringMargin + this.leftTextMargin + this.margin + (d.relativeColumn * (this.cellSize + this.cellMargin) + this.getExtraWeekendMargin(d.relativeColumn)))
      .attr('y', (d) => this.margin + (d.relativeRow * (this.cellSize + this.cellMargin))
        + Math.floor(this.cellSize * (1 - parseInt(d.data[4], 10) / 100)) )
      .attr('width', this.cellSize)
      .attr('height', (d) => Math.ceil(this.cellSize * parseInt(d.data[4], 10) / 100))
      .attr('fill', "#FF2C36");

    svg.selectAll('boxStroke')
      .data(calRows)
      .enter()
      .append('rect')
      .attr('id', (d) => (d.data[0].trim())+"-box")
      .attr('x', (d) => this.centeringMargin + this.leftTextMargin + this.margin + (d.relativeColumn * (this.cellSize + this.cellMargin) + this.getExtraWeekendMargin(d.relativeColumn)))
      .attr('y', (d) => this.margin + (d.relativeRow * (this.cellSize + this.cellMargin)))
      .attr('width', this.cellSize)
      .attr('height', this.cellSize)
      .attr('fill', 'none')
  }

  /**
   * Draw the row labels for each block as block numbers
   * @param svg
   * @param groupRefs
   */
  drawBlockRowLabels(svg, groupRefs) {

    let weeksGroup = svg.append('g').attr('class', "weeks");

    for (let i = 0; i < groupRefs.length; i++) {
      weeksGroup.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.centeringMargin + this.getBigColumnOffset(groupRefs[i].rowIndex) + this.margin + this.leftTextMargin - 10)
        .attr("y", this.getBigColumnYReset(groupRefs[i].rowIndex) + this.margin + groupRefs[i].rowIndex * (this.cellSize + this.cellMargin) + this.cellSize /2 + this.getExtraYearMargin(groupRefs[i].relativeYear))
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text("B"+ groupRefs[i].blockIndex);
    }
  }

  /**
   * Draw the --- 2022 --- type of labels between the year changes
   * @param svg
   * @param groupRefs
   */
  drawYearBreakLabels(svg, groupRefs) {
    console.log(groupRefs);

    let yearBreakLabels = svg.append("g").attr("class", "yearBreakLabels");

    let lastYear = null;
    for (let i = 0; i < groupRefs.length; i++) {
      let year = groupRefs[i].year;
      let relRow = groupRefs[i].rowIndex;
      let relYear = groupRefs[i].relativeYear;
      if (lastYear === null || lastYear !== year) {
        yearBreakLabels.append("line")
          .attr("class", "yearBreakLine")
          .attr("x1", this.getBigColumnOffset(relRow) + this.margin + this.centeringMargin + this.leftTextMargin)
          .attr("x2",this.getBigColumnOffset(relRow) + this.margin + this.centeringMargin + this.leftTextMargin + (this.cellSize + this.cellMargin)*2)
          .attr("y1",this.getBigColumnYReset(relRow) +this.margin + (relRow * (this.cellSize + this.cellMargin) + this.getExtraYearMargin(relYear) - this.extraYearMargin/2))
          .attr("y2", this.getBigColumnYReset(relRow) +this.margin + (relRow * (this.cellSize + this.cellMargin) + this.getExtraYearMargin(relYear) - this.extraYearMargin/2));

        yearBreakLabels.append("line")
          .attr("class", "yearBreakLine")
          .attr("x1", this.getBigColumnOffset(relRow) + this.margin + this.centeringMargin + this.leftTextMargin+ (this.cellSize + this.cellMargin)*4)
          .attr("x2",this.getBigColumnOffset(relRow) + this.margin + this.centeringMargin + this.leftTextMargin + (this.cellSize + this.cellMargin)*6)
          .attr("y1",this.getBigColumnYReset(relRow) +this.margin + (relRow * (this.cellSize + this.cellMargin) + this.getExtraYearMargin(relYear) - this.extraYearMargin/2))
          .attr("y2", this.getBigColumnYReset(relRow) +this.margin + (relRow * (this.cellSize + this.cellMargin) + this.getExtraYearMargin(relYear) - this.extraYearMargin/2));

        yearBreakLabels.append("text")
          .attr("class", "yearBreakLabel")
          .attr("x", this.getBigColumnOffset(relRow) + this.margin + this.centeringMargin + this.leftTextMargin + (this.cellSize + this.cellMargin)*3)
          .attr("y", this.getBigColumnYReset(relRow) +this.margin + (relRow * (this.cellSize + this.cellMargin) + this.getExtraYearMargin(relYear) - this.extraYearMargin/2))
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text(year);
      }
      lastYear = year;
    }

  }



  /**
   * Draw the row labels for each week as the calendar date
   * @param svg
   * @param groupRefs
   */
  drawWeekRowLabels(svg, groupRefs) {

    let weeksGroup = svg.append('g').attr('class', "weeks");

    for (let i = 0; i < groupRefs.length; i++) {
      weeksGroup.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.centeringMargin + this.margin + this.leftTextMargin - 10)
        .attr("y", this.margin + groupRefs[i].rowIndex * (this.cellSize + this.cellMargin) + this.cellSize /2 )
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(groupRefs[i].friendlyDate);
    }
  }

  /**
   * Create a summary set of each row and the corresponding metadata and calendar date for the row
   * @param calRows
   * @returns {*[]}
   */
  createRowReferences(calRows) {

    let rowRefs = [];

    let currentRow = null;

    for (let i = 0; i < calRows.length; i++) {
      let relRow = calRows[i].relativeRow;
      let relYear = calRows[i].relativeYear;
      let year = calRows[i].year;
      let blockIndex = calRows[i].blockIndex;

      if (currentRow === null || currentRow !== relRow) {
        let calDate = calRows[i].calDate;
        let friendlyDate = UtilRenderer.getDateString(calDate);
        rowRefs.push({rowIndex: relRow, blockIndex: blockIndex, year: year, relativeYear: relYear, friendlyDate: friendlyDate})
      }
      currentRow = relRow;
    }

    return rowRefs;
  }

  /**
   * Get the max number of year breaks in any given column, so we can make adjustments on height
   * based on the number of margins we need
   * @param calRows
   * @returns {number}
   */
  getMaxYearBreaks(calRows) {
    let maxRelativeYears = 0;

    for (let i = 0; i < calRows.length; i++) {
      let relYear = calRows[i].relativeYear;
      if (relYear > maxRelativeYears) {
        maxRelativeYears = relYear;
      }
    }
    return maxRelativeYears + 1;
  }

  /**
   * Get the number of rows in the data set
   * @param calRows
   * @returns {*}
   */
  getRowCount(calRows) {
     return calRows[calRows.length - 1].relativeRow + 1;
  }

  /**
   * Draw the w1, w2, w3 labels for the columns of the block rows
   * @param svg
   * @param bigColumns
   */
  drawWeekInBlockLabels(svg, bigColumns) {
    let weekDayGroup = svg.append('g').attr('class', "blockweeks");

    for (let c = 0; c < bigColumns; c++) {

      let bigColumnOffset = c * (this.leftTextMargin + this.margin + ((this.cellSize + this.cellMargin)*6));

      for (let i = 0; i < 6; i++) {
        weekDayGroup.append("text")
          .attr("class", "axisLabel")
          .attr("x", this.centeringMargin + bigColumnOffset + this.margin + this.leftTextMargin + (i * (this.cellSize + this.cellMargin) + this.cellSize/2))
          .attr("y", this.margin - 10)
          .attr("text-anchor", "middle")
          .text("W" + (i + 1));
      }
    }

  }

  /**
   * Draw the M, T, W labels for the days of the week
   * @param svg
   */
  drawDayOfWeekLabels(svg) {

    let weekDayGroup = svg.append('g').attr('class', "weekdays");

    for (let i = 0; i < 7; i++) {
      weekDayGroup.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.centeringMargin + this.margin + this.leftTextMargin + (i * (this.cellSize + this.cellMargin) + this.getExtraWeekendMargin(i) + this.cellSize/2))
        .attr("y", this.margin - 10)
        .attr("text-anchor", "middle")
        .text(this.formatDay(i));
    }
  }


  /**
   * Get the extra weekend margin if we're on a day index like (saturday or sunday) otherwise 0
   * @param dayIndex
   * @returns {number|number|*}
   */
  getExtraWeekendMargin(dayIndex) {
    if (dayIndex >= 5) {
      return this.extraWeekendMargin;
    }
    return 0;
  }

  /**
   * Get our extra year margin as a spacer for dividing years according to the relative year calculation
   * for the big column.  Should be 1,2,3 based on how many year transitions in the column
   * @param relativeYear
   * @returns {number}
   */
  getExtraYearMargin(relativeYear) {
    return (relativeYear) * this.extraYearMargin;
  }

  /**
   * Get the offset adjustment for the row based on what big column this row should be in
   * @param rowIndex
   * @returns {number}
   */
  getBigColumnOffset(rowIndex) {
    let bigColumn = Math.floor(rowIndex / this.maxCellsPerColumn);
    return bigColumn * ((this.cellSize + this.cellMargin) * 6 + this.leftTextMargin + this.margin);
  }

  /**
   * Get a subtractive adjustment so that the big columns to the right start at the top
   * again, subtract the adjustments we've made for prior rows
   * @param rowIndex
   * @returns {number}
   */
  getBigColumnYReset(rowIndex) {
    let bigColumn = Math.floor(rowIndex / this.maxCellsPerColumn);
    return -1 * bigColumn * Math.round(this.maxCellsPerColumn * (this.cellSize + this.cellMargin)) ;
  }

  /**
   * Parse the gt coordinates and return a json structure with the block, week, and year
   * @param coords
   * @returns {{week: number, year: string, block: number}}
   */
  parseCoordinates(coords) {
    let parts = coords.split(',');
    let week = parts[2].split(']');
    let year = parts[0].split('[');
    return {
      year: year[1],
      block: parseInt(parts[1], 10),
      week: parseInt(week[0], 10)
    }
  }


  /**
   * Organize the row data according to blocks adding some extra metadata fields to the rows
   * that we can use to help with the display.
   * @param data
   */
  mapToBlockCalendar(data) {

    let calendarRows = [];

    let lastBlockIndex = null;

    let blockCounter = 0;

    let lastYear = null;
    let relativeYearCounter = 0;

    //first year, always has a label, then for subsequent years,
    //we only break at the top if there's a year change.

    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      let calDate = new Date(d[1].trim());
      let coords = this.parseCoordinates(d[0]);
      let blockIndex = coords.block;
      let weekIndex = coords.week;
      let year = coords.year;
      if (lastBlockIndex === null || lastBlockIndex !== blockIndex) {
        blockCounter++;
      }

      if (lastYear === null || lastYear !== year) {
        relativeYearCounter++;
      }

      if (lastBlockIndex !== blockIndex && (blockCounter - 1) % this.maxCellsPerColumn === 0) {
        if (lastYear !== year) {
          relativeYearCounter = 1;
        } else {
          relativeYearCounter = 0;
        }
      }

      lastYear = year;

      calendarRows.push({
        calDate: calDate,
        year: year,
        relativeYear: relativeYearCounter,
        blockIndex: blockIndex,
        relativeRow: blockCounter - 1,
        relativeColumn : weekIndex - 1,
        data: d
      });

      lastBlockIndex = blockIndex;

    }
    console.log(calendarRows);

    return calendarRows;
  }


  /**
   * Organize the row data according to weeks adding some extra metadata fields to the rows
   * that we can use to help with the display.
   * @param data
   */
  mapToWeekCalendar(data) {
    let calendarRows = [];

    let firstDate = new Date(data[0][1].trim());
    let firstDayIndex = this.dayIndex(firstDate.getUTCDay());

    let weekCounter = 0;

    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      let calDate = new Date(d[1].trim());
      let dayIndex = this.dayIndex(calDate.getUTCDay());

      if (dayIndex === firstDayIndex) {
        weekCounter++;
      }

      calendarRows.push({
        calDate: calDate,
        relativeColumn: dayIndex,
        relativeRow: (weekCounter - 1),
        data: d
      });
    }
    console.log(calendarRows);
    return calendarRows;
  }

  dayIndex = i => (i + 6) % 7;

  formatDay = i => "MTWTFSS"[i];


  /**
   * renders the svg display of the chart with d3 support
   * These divs are populated via the displayChart() calls
   * @returns {*}
   */
  render() {
    let title = "";
    let backButton = "";

    if (!this.props.chartDto) {
      return <div>Loading...</div>;
    } else {
      title = <div className="chartTitle">{this.props.chartTitle}</div>;

      if (this.props.drillDownWeek) {
        backButton = <div className="backButton"><Icon name={"backward"} size={"large"} onClick={this.props.zoomOutToSummaryView}/></div>;
      }
    }

    return (
      <div>
        {backButton}
        {title}
        <div id="chart" className="momentumChart"/>
        <div
          id="tooltip"
          className="chartpopup"
        ></div>
      </div>
    );
  }


}
