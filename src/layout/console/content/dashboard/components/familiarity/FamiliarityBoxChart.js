import React, { Component } from "react";
import { DimensionController } from "../../../../../../controllers/DimensionController";
import * as d3 from "d3";

/**
 * this component is the box grid chart that shows relative familiarity by code area
 */
export default class FamiliarityBoxChart extends Component {
  /**
   * the constructor function which builds the FrictionBoxBubbleChart component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FamiliarityBoxChart.name + "]";
  }

  static MIN_DEFAULT_BOX_SIZE = 5;

  componentDidMount() {
    if (this.props.tableDto) {
      this.displayChart(this.props.tableDto);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.tableDto &&
      prevProps.tableDto !== this.props.tableDto
    ) {
      this.displayChart(this.props.tableDto);
    }
  }

  addClass(elementId, className) {
    let el = document.getElementById(elementId);
    if (el) {
      el.classList.add(className);
    }
  }

  removeClass(elementId, className) {
    let el = document.getElementById(elementId);
    if (el) {
      el.classList.remove(className);
    }
  }

  blankOutChart() {
    let chartDiv = document.getElementById("chart");
    if (chartDiv) {
      chartDiv.innerHTML = "";
    }
  }

  displayChart(tableData) {
    this.blankOutChart();
    const familiarityRows = this.createFamiliarityRows(tableData);
    this.createChart(familiarityRows);
  }

  /**
   * Extract out the rows to use with the column values
   * set to properties so the code is easier to read and we don't have to have
   * trims and parsing throughout the display code.
   * @param tableData
   */
  createFamiliarityRows(tableData) {

    let familiarityRows = [];

    tableData.rowsOfPaddedCells.forEach((row) => {
      const rowObj = {
        username: row[0].trim(),
        module: row[1].trim(),
        box: row[2].trim(),
        filesInBox: parseInt(row[3].trim(), 10),
        filesVisited: parseInt(row[4].trim(), 10),
        percentCoverage: parseInt(row[5].trim(), 10),
        visitsPerFile: parseFloat(row[6].trim()),
      }

      if (rowObj.box !== "default" || rowObj.filesInBox > FamiliarityBoxChart.MIN_DEFAULT_BOX_SIZE) {
        familiarityRows.push(rowObj);
      }

    });

    return familiarityRows;
  }

  /**
   * Display the chart on the screen
   * @param familiarityRows
   */
  createChart(familiarityRows) {
    let titleMargin = 45;
    this.margin = 30;
    this.marginBetweenBoxesY = 5;
    this.marginBetweenBoxesX = 10;
    this.height = DimensionController.getFullRightPanelHeight() - titleMargin;
    this.width = DimensionController.getFullRightPanelWidth() - this.margin * 2;

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", this.height + "px");

    svg.style("transition", "opacity 0.333s ease-in-out");
    svg.style("opacity", "0");

    let groupedByUser = this.groupByUser(familiarityRows);
    let boxGroupBreaks = this.createBoxGroupBreaks(groupedByUser);
    let moduleCountGroups = this.createModuleCountGroups(groupedByUser);

    let boxProps = this.calculateBoxProps(groupedByUser, boxGroupBreaks);

    this.createFamiliarityBoxes(svg, groupedByUser, boxGroupBreaks, boxProps);
    this.createBoxGroupBreakLines(svg, groupedByUser, boxGroupBreaks, boxProps);
    this.createUserLabels(svg, groupedByUser, boxProps);
    this.createModuleLabels(svg, groupedByUser, moduleCountGroups, boxProps);

    this.createFamiliarityBoxOverlays(
      svg,
      familiarityRows,
      groupedByUser,
      boxGroupBreaks,
      boxProps
    );

    setTimeout(() => {
      svg.style("opacity", "1");
    }, 100);
  }

  createModuleLabels(svg, groupedByUser, moduleCountGroups, boxProps) {
    svg.selectAll("moduleLabel")
      .data(moduleCountGroups)
      .enter()
      .append("text")
      .attr("x", (d, i) => {
        let groupMargin =
          (i - 1) * this.marginBetweenBoxesX +
          this.marginBetweenBoxesX / 2;
        return (
          boxProps.leftPadding +
          ((boxProps.boxHeight + this.marginBetweenBoxesX) * d.offset +
            ((boxProps.boxHeight + this.marginBetweenBoxesX) * d.count) / 2 + groupMargin)
        );
      })
      .attr("y", this.margin * 1.5 +
        (boxProps.boxHeight + this.marginBetweenBoxesY)
        * groupedByUser.length)
      .attr("text-anchor", "middle")
      .attr("class", "axisLabel")
      .text((d) => this.toSizedModuleLabel(d, boxProps));
  }

  toSizedModuleLabel(d, boxProps) {
    let moduleName = d.module;
    let characters = moduleName.length;
    let pixelsPerChar = 4;

    if (characters * pixelsPerChar > d.count * (boxProps.boxHeight + this.marginBetweenBoxesX)) {
      moduleName = d.module.substr(0, 1) + "..";
    }
    return moduleName;
  }

  createModuleCountGroups(groupedByUser) {
    let rows = []; //default in case we have no columns

    if (groupedByUser.length > 0) {
      rows = groupedByUser[0].rows;
    }

    let moduleGroups = [];
    let lastModule = null;
    let boxInModuleCount = 0;
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let module = row.module;

      if (lastModule !== null && module !== lastModule) {
        moduleGroups.push({
          module: lastModule,
          count: boxInModuleCount,
          offset: i - boxInModuleCount,
        });
        boxInModuleCount = 0;
      }
      lastModule = module;
      boxInModuleCount++;
    }
    if (rows.length > 0) {
      moduleGroups.push({
        module: lastModule,
        count: boxInModuleCount,
        offset: rows.length - boxInModuleCount,
      });
    }

    return moduleGroups;
  }

  createUserLabels(svg, groupedByUser, boxProps) {
    svg
      .selectAll("nameLabel")
      .data(groupedByUser)
      .enter()
      .append("text")
      .attr("x", boxProps.leftPadding - this.marginBetweenBoxesX)
      .attr("y", (d, i) => {
        return (
          this.margin +
          (i + 0.5) *
            (boxProps.boxHeight + this.marginBetweenBoxesY)
        );
      })
      .attr("text-anchor", "end")
      .attr("class", "axisLabel")
      .text((d) => d.username);
  }

  calculateBoxProps(groupedByUser, boxGroupBreaks) {
    let maxBoxHeight = 30;

    let rows = groupedByUser.length;
    let columns = 0; //default in case we have no columns

    if (groupedByUser.length > 0) {
      columns = groupedByUser[0].rows.length;
    }

    let boxGroupMargin = boxGroupBreaks.size * this.marginBetweenBoxesX;

    let boxHeightY = (this.height - this.margin * 3.5) / rows - this.marginBetweenBoxesY;
    let boxHeightX = (this.width - this.margin * 2 - boxGroupMargin) / columns - this.marginBetweenBoxesX;

    let boxHeight = boxHeightY;
    if (boxHeightX < boxHeightY) {
      boxHeight = boxHeightX;
    }

    if (boxHeight > maxBoxHeight) {
      boxHeight = maxBoxHeight;
    }

    let extraLeftPaddingToCenter = (this.width - (boxHeight * columns
        + this.marginBetweenBoxesX * columns + boxGroupMargin)) / 2;

    return {
      boxHeight: boxHeight,
      rows: rows,
      columns: columns,
      boxGroupTotalMargin: boxGroupMargin,
      leftPadding: extraLeftPaddingToCenter,
    };
  }

  createBoxGroupBreakLines(svg, groupedByUser, boxGroupBreaks, boxProps) {
    let offsetCount = 0;
    for (let breakIndex of boxGroupBreaks) {
      let xPosition = boxProps.leftPadding +
        (boxProps.boxHeight * (breakIndex + 1) +
          this.marginBetweenBoxesX * (breakIndex + 1) +
          offsetCount * this.marginBetweenBoxesX);

      svg.append("line")
        .attr("x1", xPosition)
        .attr("x2", xPosition)
        .attr("y1", this.margin)
        .attr(
          "y2",
          this.margin * 1.5 +
            (boxProps.boxHeight +
              this.marginBetweenBoxesY) *
              groupedByUser.length
        )
        .attr("stroke-dasharray", "8,3")
        .attr("class", "groupDiv");

      offsetCount++;
    }
  }

  createFamiliarityBoxOverlays(
    svg,
    data,
    groupedByUser,
    boxGroupBreaks,
    boxProps
  ) {
    var interp = d3
      .scaleLinear()
      .domain([0, 5, 25, 100])
      .range(["white", "#9C6EFA", "#7846FB", "#4100cE"]);

    for (let i = 0; i < groupedByUser.length; i++) {
      let offsetCount = 0;
      let rows = groupedByUser[i].rows;

      svg
        .selectAll(".box" + i)
        .data(rows)
        .enter()
        .append("rect")
        .attr("x", (d, index) => {
          let extraOffset = offsetCount * this.marginBetweenBoxesX;
          if (boxGroupBreaks.has(index)) {
            offsetCount++;
          }
          return (
            boxProps.leftPadding +
            extraOffset +
            boxProps.boxHeight * index +
            this.marginBetweenBoxesX * index
          );
        })
        .attr("y", (d) => {
          return (
            this.margin +
            i * boxProps.boxHeight +
            this.marginBetweenBoxesY * i +
            Math.round(
              boxProps.boxHeight *
                (1 - d.percentCoverage / 100)
            )
          );
        })
        .attr("width", boxProps.boxHeight)
        .attr("height", (d) =>
          Math.round(boxProps.boxHeight * (d.percentCoverage / 100))
        )
        .attr("fill", (d) => interp(d.visitsPerFile))
        .attr("class", "boxOverlay");
    }
  }

  createFamiliarityBoxes(svg, groupedByUser, boxGroupBreaks, boxProps) {
    for (let i = 0; i < groupedByUser.length; i++) {
      let offsetCount = 0;
      let that = this;
      svg
        .selectAll(".box" + i)
        .data(groupedByUser[i].rows)
        .enter()
        .append("rect")
        .attr("x", (d, index) => {
          let extraOffset = offsetCount * this.marginBetweenBoxesX;
          if (boxGroupBreaks.has(index)) {
            offsetCount++;
          }
          return (
            boxProps.leftPadding +
            extraOffset +
            boxProps.boxHeight * index +
            this.marginBetweenBoxesX * index
          );
        })
        .attr("y", this.margin + i * boxProps.boxHeight + this.marginBetweenBoxesY * i)
        .attr("width", boxProps.boxHeight)
        .attr("height", boxProps.boxHeight)
        .attr("class", "box")
        .attr("fill", "black")
        .on("mouseover", function (event, d) {
          let xPosition = parseInt(
            event.target.getAttribute("x"),
            10
          );
          let yPosition = parseInt(
            event.target.getAttribute("y"),
            10
          );

          let shiftBelowBox = 30;

          let html =
            "<div class='tipBox'>" +
            d.username +
            ":: " +
            d.module +
            "." +
            d.box +
            "</div>";
          html +=
            "<div class='tipDetail'>" +
            d.filesVisited +
            "/" +
            d.filesInBox +
            " files</div>";
          html +=
            "<div class='tipDetail'>" +
            d.visitsPerFile +
            " visits per file</div>";

          let tipEl = document.getElementById("tooltip");
          tipEl.innerHTML = html;

          let tipWidth = tipEl.clientWidth;

          d3.select("#tooltip")
            .html(html)
            .style("left", (xPosition - tipWidth/2 + that.margin
              + boxProps.boxHeight / 2 + that.marginBetweenBoxesX / 2) + "px")
            .style("top", yPosition + 45 + 50 + shiftBelowBox + "px"
            )
            .style("opacity", 0.85);
        })
        .on("mouseleave", function (event, d) {
          d3.select("#tooltip").style("left", -1000 + "px");
        });
    }
  }

  createBoxGroupBreaks(groupedByUser) {
    let boxGroupBreaks = new Set();

    let boxRowsForUser = [];
    if (groupedByUser.length > 0) {
      boxRowsForUser = groupedByUser[0].rows;
    }

    let lastModule = null;
    for (let i = 0; i < boxRowsForUser.length; i++) {
      let row = boxRowsForUser[i];
      let module = row.module;
      if (lastModule !== null && module !== lastModule) {
        boxGroupBreaks.add(i - 1);
      }
      lastModule = module;
    }
    return boxGroupBreaks;
  }

  groupByUser(data) {
    let userRows = [];

    let lastUsername = null;
    let currentRowSet = [];
    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      let username = d.username;
      if (!lastUsername || username === lastUsername) {
        currentRowSet.push(d);
      } else {
        userRows.push({username: lastUsername, rows: currentRowSet,});
        currentRowSet = [];
        currentRowSet.push(d);
      }
      lastUsername = username;
    }

    userRows.push({
      username: lastUsername,
      rows: currentRowSet,
    });

    return userRows;
  }

  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    let title = "";

    if (!this.props.tableDto) {
      return <div>Loading...</div>;
    } else {
      title = (
        <div className="chartTitle">
          Familiarity by Code Module
        </div>
      );
    }

    return (
      <div>
        {title}
        <div id="chart" className="familiarityChart" />
        <div id="tooltip" className="chartpopup"/>
      </div>
    );
  }
}
