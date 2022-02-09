import React, {Component} from "react";
import {DimensionController} from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this is the gui component that displays the IFM chart
 */
export default class FlowChart extends Component {

  /**
   * builds the IFM chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowChart]";
  }

  static CONFUSION = "confusion";
  static MOMENTUM = "momentum";

  static GREEN_TEST_COLOR = "green";
  static RED_TEST_COLOR = "red";


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevProps.chartDto && this.props.chartDto) {
      this.displayChart(this.props.chartDto);
    }

    if (this.props.cursorOffset === null) {
      this.hideCursor();
    } else if (prevProps.cursorOffset !== this.props.cursorOffset) {
      this.moveCursorToPosition(this.props.cursorOffset);
    }
  }

  hideCursor() {
    let cursorEl = document.getElementById('intention-cursor');
    cursorEl.style.opacity = 0;
    cursorEl.style.transform="translate(0px, 0px)";
  }

  moveCursorToPosition(offset) {
    if ( this.xScale) {
      let newPosition = Math.round(this.xScale(offset)) - this.margin;
      let cursorEl = document.getElementById('intention-cursor');
      cursorEl.style.opacity = 1;
      cursorEl.style.transform="translate("+newPosition+"px, 0px)";
    }
  }

  displayChart(chart) {
    this.margin = 30;
    let svgHeight = DimensionController.getFullRightPanelHeight() - 180;
    this.chartHeight = svgHeight - 2* this.margin;
    this.width = DimensionController.getFullRightPanelWidth();

    let data = chart.chartSeries.rowsOfPaddedCells;

    let svg = d3.select('#chart')
      .append('svg')
      .attr('width', this.width + 'px')
      .attr('height', svgHeight + 'px');


    let xMinMax = d3.extent(data,function(d){
      return parseInt(d[3], 10);
    });

    //the max will be highest offset + duration
    xMinMax[1] = xMinMax[1] + parseInt(data[data.length - 1][2], 10);

    this.xScale = d3.scaleLinear()
      .domain([xMinMax[0],xMinMax[1]])
      .range([this.margin,this.width-this.margin]);

    this.yScale = d3.scaleLinear()
      .domain([100,0])
      .range([this.margin,this.chartHeight]);

    var interp = d3.scaleLinear()
      .domain([0, 0.2, 0.4, 1])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

    let barWidthByCoordsMap = this.createBarWidthByCoordsMap(data, this.xScale);
    let tileLocationMap = this.createTileLocationDataMap(chart);
    let tileWtfMap = this.createTileWtfDataMap(chart);
    let tileExecMap = this.createTileExecDetailsMap(data, chart);

    const chartGroup = svg.append("g")
      .attr('class', 'ifm');

    let bars = this.createBars(chartGroup, data, interp);
    this.addBarActivityTooltip(bars, this, barWidthByCoordsMap, tileLocationMap, tileWtfMap);

    this.addDataBreakLines(chart, chartGroup);

    this.createInvisibleBoundingBox(chartGroup);

    //exec dots should be on top of the invis box so that exec tips turn on, and bar tips turn off
    this.addExecDots(chart, chartGroup, barWidthByCoordsMap, tileExecMap);
    this.addIntentionCursor(chartGroup, xMinMax);

    this.createTimeAxis(chartGroup, xMinMax);
    this.createLegend(svg, chartGroup, interp);

  }



  createBars(chartGroup, data, interp) {
    var colorScale = d3.scaleOrdinal()
      .domain([FlowChart.CONFUSION, FlowChart.MOMENTUM])
      .range(["#FF2C36", "#7846FB"]);

    let mScale = d3.scaleLinear()
      .domain([0,200])
      .range([0,1]);


    let stackGen = d3.stack()
      .keys([FlowChart.CONFUSION, FlowChart.MOMENTUM])
      .value(function (d, key) {
        if (key === FlowChart.CONFUSION) {
          return parseInt(d[4], 10);
        } else if (key === FlowChart.MOMENTUM) {
          return (100 - parseInt(d[4], 10));
        }
        return 0;
      });

    let stackedSeries = stackGen(data);

    let bars = chartGroup.selectAll("g")
      .data(stackedSeries)
      .enter()
      .append("g")
      .attr("fill", (d) => {
        return colorScale(d.key);
      })
      .attr('class', (d) => d.key)
      .selectAll("rect")
      .data(d => {
        return d;
      })
      .enter()
      .append("rect")
      .attr("x", (d) => this.xScale(d.data[3]))
      .attr("y",  (d) => this.yScale(d[1]))
      .attr("height", (d) => this.yScale(d[0]) -  this.yScale(d[1]))
      .attr("width", (d) => this.xScale(parseInt(d.data[3], 10) + parseInt(d.data[2], 10)) - this.xScale(parseInt(d.data[3], 10)) - 0.2)
      .attr("fill", (d) => {
        return interp(mScale(parseInt(d.data[8], 10)));
      });

    chartGroup.selectAll(".confusion rect")
      .attr("fill", (d) => {
        return colorScale(FlowChart.CONFUSION);
      });

    return bars;
  }

  addBarActivityTooltip(bars, that, barWidthByCoordsMap, tileLocationMap, tileWtfMap) {
    bars.on('mouseover', function(event, d){
      let html = "";

      let coords = d.data[0].trim();
      let offset = that.xScale(parseInt(d.data[3], 10)) + that.lookupBarWidth(barWidthByCoordsMap, d.data[0])/2;
      let files = tileLocationMap[coords];
      let wtfs = tileWtfMap[coords];

      if (files) {
        for (let i = 0; i < files.length;i++) {
          if (files[i].isModified.trim() === "true") {
            html += "<div class='modifiedfile'><span class='filename'>"+files[i].file+"</span><span class='duration'>"+files[i].duration+"</span></div>\n";
          } else {
            html += "<div class='file'><span class='filename'>"+files[i].file+"</span><span class='duration'>"+files[i].duration+"</span></div>\n";
          }
        }
      }

      if (wtfs && wtfs.length > 0) {
        if (files) { html += "<div>&nbsp;</div>"}
        html += "<div class='wtftip'><span class='circuitName'>"+wtfs[0].circuitName+"</span><span class='duration'>"+wtfs[0].duration+"</span></div>\n";
        html += "<div class='wtfdescription'>"+wtfs[0].description+"</div>";
      }

      if (!wtfs && !files) {
        html += "<span class='noactivity'>No file activity</span>";
      }

      d3.select('#tooltip')
        .html(html);

      let tooltipEl = document.querySelector('#tooltip');

      if (offset < (that.margin + 100) ) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("popupleft");

        d3.select('#tooltip')
          .style('left', (offset - (tooltipEl.clientWidth * 0.2) + 5) + "px")
          .style('top', (that.chartHeight * 1.3) + "px")
          .style('opacity', 0.95);
      } else if (offset > (that.width - that.margin - 100)) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.add("popupright");

        d3.select('#tooltip')
          .style('left', (offset - tooltipEl.clientWidth * 0.95 + 5) + "px")
          .style('top', (that.chartHeight * 1.3) + "px")
          .style('opacity', 0.95);
      } else {
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("chartpopup");

        d3.select('#tooltip')
          .style('left', (offset - tooltipEl.clientWidth/2 + 5) + "px")
          .style('top', (that.chartHeight * 1.3) + "px")
          .style('opacity', 0.95);
      }
    })

    d3.select('#tooltip')
    .on('mouseleave', function(event, d){
      d3.select('#tooltip')
        .style('left', "-1000px");
    });
  }

  addDataBreakLines(chart, chartGroup) {
    let dataBreaks = chart.featureSeriesByType["@nav/break"].rowsOfPaddedCells;

    let dataBreakLines = chartGroup.append("g")
      .selectAll(".break")
      .data(dataBreaks)
      .enter()
      .append('line')
      .attr('x1', (d) => this.xScale(d[1]))
      .attr('x2', (d) => this.xScale(d[1]))
      .attr('y1', this.margin)
      .attr('y2', this.chartHeight)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('class', 'break');


    let that = this;

    dataBreakLines.on('mouseover', function(event, d){
      let offset = that.xScale(d[1]);
      let friendlyDuration = that.convertSecondsToFriendlyDuration(parseInt(d[3], 10));
      let html = "<div class='databreak'>Break "+friendlyDuration+"</div>";

      d3.select('#tooltip')
        .html(html);

      let tooltipEl = document.querySelector('#tooltip');

      if (offset < (that.margin + 100) ) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("popupleft");

        d3.select('#tooltip')
          .style('left', (offset - (tooltipEl.clientWidth * 0.2) + 5) + "px")
          .style('top', (that.chartHeight * 1.3) + "px")
          .style('opacity', 0.95);
      } else if (offset > (that.width - that.margin - 100)) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.add("popupright");

        d3.select('#tooltip')
          .style('left', (offset - tooltipEl.clientWidth * 0.95 + 5) + "px")
          .style('top', (that.chartHeight * 1.3) + "px")
          .style('opacity', 0.95);
      } else {
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("chartpopup");

        d3.select('#tooltip')
          .style('left', (offset - tooltipEl.clientWidth/2 + 5) + "px")
          .style('top', (that.chartHeight * 1.3) + "px")
          .style('opacity', 0.95);
      }
    })

    d3.select('#tooltip')
      .on('mouseleave', function(event, d){
        d3.select('#tooltip')
          .style('left', "-1000px");
      });


    return dataBreakLines;
  }

  createTimeAxis(chartGroup, xMinMax) {

    let endTimer = UtilRenderer.getRelativeTimerAsHoursMinutes(parseInt(xMinMax[1], 10));

    let grp = chartGroup.append("g")
      .attr('class', 'axis');

    grp.append('line')
      .attr('x1', (d) => this.xScale(xMinMax[0]))
      .attr('y1', this.margin)
      .attr('x2', (d) => this.xScale(xMinMax[0]))
      .attr('y2', this.chartHeight + 25)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1);

    grp.append('text')
      .attr('x', this.xScale(xMinMax[0]))
      .attr('y', this.chartHeight + 42)
      .attr('text-anchor', 'middle')
      .attr('class', 'axisLabel')
      .text('00:00');

    grp.append('line')
      .attr('x1', (d) => this.xScale(xMinMax[1]))
      .attr('y1', this.margin)
      .attr('x2', (d) => this.xScale(xMinMax[1]))
      .attr('y2', this.chartHeight + 25)
      .attr('stroke', 'gray')
      .attr('stroke-width', 1);

    grp.append('text')
      .attr('x', this.xScale(xMinMax[1]))
      .attr('y', this.chartHeight + 42)
      .attr('text-anchor', 'middle')
      .attr('class', 'axisLabel')
      .text(endTimer);
  }

  createLegend(svg, chartGroup, interp) {
    let barsize = 100;
    let margin = 10;
    let defs = svg.append("defs");

      let gradient = defs.append("linearGradient")
            .attr("id", "momentumGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", interp(0));

    gradient.append("stop")
      .attr("offset", "20%")
      .attr("stop-color", interp(0.2));

    gradient.append("stop")
      .attr("offset", "40%")
      .attr("stop-color", interp(0.4));

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", interp(1));

    chartGroup.append("rect")
      .attr("fill", "url(#momentumGradient)")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x", this.width - this.margin - barsize)
      .attr("y", 10)
      .attr("width", barsize)
      .attr("height", 10);

    chartGroup.append('text')
      .attr('x', this.width - this.margin - barsize - margin )
      .attr('y', 19)
      .attr('text-anchor', 'end')
      .attr('class', 'axisLabel')
      .text("Momentum:");

    chartGroup.append("rect")
      .attr("fill", "#FF2C36")
      .attr("stroke", "rgba(74, 74, 74, 0.96)")
      .attr("x", this.width - this.margin - barsize - margin - 90)
      .attr("y", 10)
      .attr("width", 10)
      .attr("height", 10);

    chartGroup.append('text')
      .attr('x', this.width - this.margin - barsize - margin * 2 - 90 )
      .attr('y', 19)
      .attr('text-anchor', 'end')
      .attr('class', 'axisLabel')
      .text("Confusion:");

  }

  convertSecondsToFriendlyDuration(seconds) {
    if (seconds >=  86400) {
      let days = Math.round((seconds / 86400));
      if (days > 1) {
        return days + " days";
      } else {
        return days + " day";
      }
    } else if (seconds >= 3600) {
      let hours =  Math.round((seconds / 3600));
      if (hours > 1) {
        return hours + " hours";
      } else {
        return hours + " hour";
      }
    } else if (seconds >= 60) {
      let minutes =  Math.round((seconds / 60));
      if (minutes > 1) {
        return minutes + " minutes";
      } else {
        return minutes + " minute";
      }
    } else {
      return seconds + " seconds";
    }

  }

  addIntentionCursor(chartGroup, xMinMax) {
    chartGroup.append('line')
      .attr('x1', Math.round(this.xScale(xMinMax[0])))
      .attr('x2', Math.round(this.xScale(xMinMax[0])))
      .attr('y1', this.margin - 10)
      .attr('y2', this.chartHeight + 10)
      .attr('stroke', '#7f0')
      .attr('stroke-width', 2)
      .attr('id', 'intention-cursor')

    let cursorEl = document.getElementById('intention-cursor');
    cursorEl.style.transition = "1s ease";
  }

  addExecDots(chart, chartGroup, barWidthByCoordsMap, tileExecMap) {

    let execSummaryData = chart.featureSeriesByType["@exec/count"].rowsOfPaddedCells;
    let execYMargin = 10;
    let execRadius = 3;

    let dotGrp = chartGroup.append("g");

    dotGrp.selectAll('execdot1')
      .data(execSummaryData)
      .enter()
      .append('circle')
      .attr('class', 'execdot')
      .attr('cx',(d) => this.xScale(d[1]) + this.lookupBarWidth(barWidthByCoordsMap, d[0])/2 )
      .attr('cy', this.chartHeight + execYMargin)
      .attr('r', execRadius)
      .attr('fill', (d) => this.getFirstDotColor(d));

    dotGrp.selectAll('execdot2')
      .data(execSummaryData)
      .enter()
      .append('circle')
      .attr('class', 'execdot')
      .attr('cx',(d) => this.xScale(d[1]) + this.lookupBarWidth(barWidthByCoordsMap, d[0])/2 )
      .attr('cy', this.chartHeight + (execYMargin * 2))
      .attr('r', (d) => {
        if (this.hasSecondDot(d)) {
          return execRadius;
        } else {
          return 0;
        }
      })
      .attr('fill', (d) => this.getMidDotColor(d));

    dotGrp.selectAll('execdot3')
      .data(execSummaryData)
      .enter()
      .append('circle')
      .attr('class', 'execdot')
      .attr('cx',(d) => this.xScale(d[1]) + this.lookupBarWidth(barWidthByCoordsMap, d[0])/2 )
      .attr('cy', this.chartHeight + (execYMargin * 3))
      .attr('fill', (d) => this.getThirdDotColor(d))
      .attr('r', (d) => {
        if (this.hasThirdDot(d)) {
          return execRadius;
        } else {
          return 0;
        }
      })
    ;

    let that = this;

    dotGrp.selectAll('exectrigger')
      .data(execSummaryData)
      .enter()
      .append('rect')
      .attr("x", (d) => (this.xScale(d[1])))
      .attr("y",  this.chartHeight + execYMargin - execRadius)
      .attr("height",  execYMargin * 3)
      .attr("width", (d) => this.lookupBarWidth(barWidthByCoordsMap, d[0]))
      .attr("fill", 'red')
      .attr("opacity", 0)

      .on('mouseover', function(event, d){
      let offset = that.xScale(d[1]);

      let execDetails = tileExecMap[d[0].trim()];

      let html = "";

      if (execDetails) {
        if (execDetails[0].haystack != null) {
          html += "<div class='haystack'>Haystack Size: "+execDetails[0].haystack+"</div>";
          html += "<br/><br/>";
        }

        for (let i = 0; i < execDetails.length; i++) {
          let row = execDetails[i];
          let cycles = parseInt(row.red, 10) + parseInt(row.green, 10);

          html += "<div class='exectip'><span class='process'>"+row.exec+"</span>" +
            "<span class='duration'>"+row.tExecTime+
             "<span> | "+cycles+" cycles | </span>" +
              "<span class='fail'>"+row.red+"</span> | " +
              "<span class='pass'>"+row.green+"</span> | " +
              "<span class='debug'>"+row.debug+"<i class='bug icon'></i></span>" +
            "</span></div>";
        }
      } else {
        console.warn("No exec details found when expected for gt "+d[0]+"! ");
      }

      d3.select('#tooltip')
        .html(html);

      let tooltipEl = document.querySelector('#tooltip');

      if (offset < (that.margin + that.width / 2 - 150) ) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("popupleft");

        d3.select('#tooltip')
          .style('left', (offset - (tooltipEl.clientWidth * 0.2) + 5 + that.lookupBarWidth(barWidthByCoordsMap, d[0])/2) + "px")
          .style('top', (that.chartHeight * 1.3 + (execYMargin * 4)) + "px")
          .style('opacity', 0.95);
      } else if (offset > (that.width - that.width / 2 + 150)) {
        tooltipEl.classList.remove("chartpopup");
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.add("popupright");

        d3.select('#tooltip')
          .style('left', (offset - tooltipEl.clientWidth * 0.95 + 5 + that.lookupBarWidth(barWidthByCoordsMap, d[0])/2)  + "px")
          .style('top', (that.chartHeight * 1.3 + (execYMargin * 4)) + "px")
          .style('opacity', 0.95);
      } else {
        tooltipEl.classList.remove("popupleft");
        tooltipEl.classList.remove("popupright");
        tooltipEl.classList.add("chartpopup");

        d3.select('#tooltip')
          .style('left', (offset - tooltipEl.clientWidth/2 + 5 + that.lookupBarWidth(barWidthByCoordsMap, d[0])/2) + "px")
          .style('top', (that.chartHeight * 1.3 + (execYMargin * 4)) + "px")
          .style('opacity', 0.95);
      }
    })

    d3.select('#tooltip')
      .on('mouseleave', function(event, d){
        d3.select('#tooltip')
          .style('left', "-1000px");
      });


  }

  createInvisibleBoundingBox(chartGroup) {

    let boundingBox = chartGroup.append("g");

    //left line
    boundingBox.append("line")
      .attr('x1', this.margin / 2)
      .attr('y1', this.margin / 2)
      .attr('x2', this.margin / 2)
      .attr('y2', this.chartHeight + this.margin / 2)
      .attr("stroke-width", "30px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    //bottom line
    boundingBox.append("line")
      .attr('x1', this.margin / 2)
      .attr('y1', this.chartHeight + this.margin / 2)
      .attr('x2', this.width - this.margin / 2)
      .attr('y2', this.chartHeight + this.margin / 2)
      .attr("stroke-width", "30px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    //right line
    boundingBox.append("line")
      .attr('x1', this.width - this.margin / 2)
      .attr('y1', this.margin / 2)
      .attr('x2', this.width - this.margin / 2)
      .attr('y2', this.chartHeight + this.margin / 2)
      .attr("stroke-width", "30px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    //top line
    boundingBox.append("line")
      .attr('x1', this.margin / 2)
      .attr('y1', this.margin / 2)
      .attr('x2', this.width - this.margin / 2)
      .attr('y2', this.margin / 2)
      .attr("stroke-width", "30px")
      .attr("stroke", "blue")
      .attr("opacity", 0);

    boundingBox.on('mouseover', function(event, d){
      d3.select('#tooltip')
        .style('left', "-1000px");
    });
  }

  extractFileName(filePath) {
    let lastSlash = filePath.lastIndexOf('/');
    if (lastSlash > 0) {
      return filePath.substring(lastSlash + 1);
    } else {
      return filePath;
    }
  }

  lookupBarWidth(map, coords) {
    let barWidth = map[coords.trim()];
    if (!barWidth) {
      console.error("no bar width found!");
      return 20;
    }
    return barWidth;
  }

  createBarWidthByCoordsMap(data, xScale) {
    let map = [];

    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      map[d[0].trim()] = xScale(parseInt(d[3], 10) + parseInt(d[2], 10)) - xScale(parseInt(d[3], 10)) - 0.2;
    }
    return map;
  }

  createTileExecDetailsMap(data, chart) {
    let execData = chart.featureSeriesByType["@exec/runtime"].rowsOfPaddedCells;
    let haystackData = chart.eventSeriesByType["@exec/haystak"].rowsOfPaddedCells;

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

      let execEntry = {exec: process, offset: offset, red: red, green: green, debug: debug, tExecTime: execTime, haystack: null};

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
        console.warn("no execs for haystack at "+coords + "!");
      }
    }

    return execDetailMap;
  }

  createTileWtfDataMap(chart) {
    let chartSeries = chart.chartSeries.rowsOfPaddedCells;
    let wtfData = chart.eventSeriesByType["@flow/wtf"].rowsOfPaddedCells;

    let tileWtfMap = [];

    for (let i = 0; i < wtfData.length; i++) {
      let row = wtfData[i];
      let coords = row[0].trim();
      let circuitName = row[3].trim();
      let duration = row[4].trim();
      let description = row[5].trim();

      let wtfEntry = {circuitName: circuitName, duration: duration, description: description};

      let coordData = tileWtfMap[coords];
      if (!coordData) {
        tileWtfMap[coords] = [wtfEntry];
      } else {
        coordData.push(wtfEntry);
      }
    }

    //add in extra entries for wtfs carrying over to additional tiles

    let lastWtf = null;

    for (let i=0; i < chartSeries.length; i++) {
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

  createTileLocationDataMap(chart) {
    let locationData = chart.featureSeriesByType["@place/location"].rowsOfPaddedCells;

    let tileLocationMap = [];
    //so each row, has coords, file, duration, and modified
    //so I need to combine all these by coords, first of all to prep the dataset

    for (let i = 0; i < locationData.length; i++) {
      let row = locationData[i];
      let coords = row[0].trim();
      let file = this.extractFileName(row[1].trim());
      let isModified = row[3].trim();
      let duration = row[2].trim();

      let fileEntry = {file: file, isModified: isModified, duration: duration};
      let coordData = tileLocationMap[coords];
      if (!coordData) {
        tileLocationMap[coords] = [fileEntry];
      } else {
        coordData.push(fileEntry);
      }
    }

    return tileLocationMap;
  }

  getFirstDotColor(d) {
    let red = parseInt(d[3], 10);

    if (red > 0) {
      return FlowChart.RED_TEST_COLOR;
    } else {
      return FlowChart.GREEN_TEST_COLOR;
    }
  }

  getMidDotColor(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);

    if (green > red || (green > 0 && !this.hasThirdDot(d))) {
      return FlowChart.GREEN_TEST_COLOR;
    } else {
      return FlowChart.RED_TEST_COLOR;
    }
  }

  getThirdDotColor(d) {
    let green = parseInt(d[4], 10);

    if (green > 0) {
      return FlowChart.GREEN_TEST_COLOR;
    } else {
      return FlowChart.RED_TEST_COLOR;
    }
  }

  hasFirstDot(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);
    if (red + green > 0) {
      return true;
    }
    return false;
  }

  hasSecondDot(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);
    if (red + green > 2) {
      return true;
    }
    return false;
  }

  hasThirdDot(d) {
    let red = parseInt(d[3], 10);
    let green = parseInt(d[4], 10);
    if (red + green > 3) {
      return true;
    }
    return false;
  }


  /**
   * renders the svg display of the chart with d3 support
   * @returns {*}
   */
  render() {
    return (
      <div>
        <div id="chart" />
        <div id="tooltip" className="chartpopup">
        </div>
      </div>
    );
  }


}
