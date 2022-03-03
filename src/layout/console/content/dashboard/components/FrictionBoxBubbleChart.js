import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import * as d3 from "d3";
import {ChartClient} from "../../../../../clients/ChartClient";
import UtilRenderer from "../../../../../UtilRenderer";
/**
 * this component is the tab panel wrapper for a bubble chart
 */
export default class FrictionBoxBubbleChart extends Component {
  /**
   * the constructor function which builds the FrictionBoxBubbleChart component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + FrictionBoxBubbleChart.name + "]";
  }

  componentDidMount() {
    if (this.props.tableDto) {
      this.displayChart(this.props.tableDto);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevProps.tableDto && this.props.tableDto) {
      this.displayChart(this.props.tableDto);
    }

    if (prevProps.selectedRowId !== this.props.selectedRowId ) {
      this.updateCircleSelection(prevProps.selectedRowId, this.props.selectedRowId);
    }

    if (prevProps.hoverRowId !== this.props.hoverRowId ) {
      this.updateCircleHover(prevProps.hoverRowId, this.props.hoverRowId);
    }
  }

  updateCircleSelection(oldId, newId) {
    if (oldId) {
      document.getElementById(oldId).classList.remove('active');
    }
    if (newId) {
      document.getElementById(newId).classList.add('active');
    }
  }

  updateCircleHover(oldId, newId) {
    if (oldId) {
      document.getElementById(oldId).classList.remove('hover');
    }
    if (newId) {
      document.getElementById(newId).classList.add('hover');
    }
  }

  /**
   * Display the chart on the screen
   * @param tableDto
   */
  displayChart(tableDto) {
    let height = DimensionController.getFullRightPanelHeight();
    let width = height; //make the chart a square
    let margin = 30;
    let padding = 2;

    let treeData = this.createTreeRoot(tableDto.rowsOfPaddedCells);

    console.log(treeData);

    const root = d3.hierarchy(treeData, (d) => {return d.children});

    root.sum(d => Math.max(0, d.value));

    const pack = d3.pack()
      .size([height - margin, height - margin])
      .padding(padding);

    let packed = pack(root);
    console.log(packed);

    let svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + "px")
      .attr("height", height + "px");

    this.createCircles(svg, packed, margin);

    this.createCircleLabels(svg, packed, margin);

  }


  /**
   * Create the circles representing the amount of friction experienced
   * @param svg
   * @param packed
   * @param margin
   */
  createCircles(svg, packed, margin) {

    let xMinMaxConfusion = d3.extent(packed.children, function (d) {
      return d.data.confusionPercent;
    });

    let confusionScale = d3
      .scaleLinear()
      .domain([0.1, xMinMaxConfusion[1]])
      .range([0, 1]);

    var interp = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range(["#FFA500", "#FF2C36", "#720000"]);

    let that = this;
    svg.selectAll('.node')
      .data(packed)
      .enter()
      .append("circle")
      .attr('class', d => d.children ? 'parent' : 'node')
      .attr('id', d => d.data.name)
      .attr("fill", d => d.children ? "#fff" : interp(confusionScale(d.data.confusionPercent)))
      .attr("opacity", d => d.children ? 0 : 1)
      .attr("cx", d => d.x+margin)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .on("mouseover", function (event, d) {
        that.props.onHoverCircle(d.data.name);
      })
      .on("click", function (event, d) {
        that.props.onClickCircle(d.data.name);
      })
    ;
  }

  /**
   * Create the group and metric labels on the circles
   * @param svg
   * @param packed
   * @param margin
   */
  createCircleLabels(svg, packed, margin) {
    let minRadius = 30;
    let superMinRadius = 10;

    svg.selectAll('.circleClip')
      .data(packed)
      .enter()
      .append("clipPath")
      .attr("id", d => "clip-"+d.data.name)
      .append("circle")
      .attr("r", d => d.r)
      .attr("cx", d => d.x + margin)
      .attr("cy", d => d.y);


    svg.selectAll('.circleLabel')
      .data(packed)
      .enter()
      .append("text")
      .attr("x", d => d.x + margin)
      .attr("y", d => d.y)
      .attr("clip-path", d => "url(#clip-" + d.data.name + ")")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", d => d.r > minRadius ? "top" : "middle")
      .attr("class", "circleLabel")
      .attr("opacity", d => d.children ? 0 : 1)
      .text(d => d.r > superMinRadius ? d.data.label : "");

    svg.selectAll('.circleMetric')
      .data(packed)
      .enter()
      .append("text")
      .attr("x", d => d.x + margin)
      .attr("y", d => d.y + 14)
      .attr("clip-path", d => "url(#clip-" + d.data.name + ")")
      .attr("text-anchor", "middle")
      .attr("class", "circleMetric")
      .attr("opacity", d => d.children ? 0 : 1)
      .text(d => d.r > minRadius ? d.data.friendlyValue : "");
  }

  /**
   * Take the input rows of data and create a tree root data structure
   * that can be used for the bubble chart
   * @param data
   */
  createTreeRoot(data) {
    let root = {name: "root", children: []};

    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      let duration = Math.round(UtilRenderer.getSecondsFromDurationString(d[2].trim()) / 60);
      let confusion = Math.round(parseFloat(d[3].trim()));
      let progress = Math.round(parseFloat(d[5].trim()));
      let confusionRate = confusion / (progress > 0? progress : 1);
      let confusionDuration = Math.round((confusion * duration) / 100);
      let child = {name: d[0].trim() + "-"+d[1].trim(), label: d[1].trim(), value: confusionDuration,
        friendlyValue: UtilRenderer.convertSecondsToFriendlyDuration(confusionDuration * 60),
        confusionPercent: confusion, confusionRate: confusionRate, confusionDuration: confusionDuration};

      root.children.push(child);
    }

    return root;
  }



  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
       <div id="chart" />
    );
  }
}
