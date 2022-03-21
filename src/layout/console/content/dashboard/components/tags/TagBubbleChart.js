import React, {Component} from "react";
import {DimensionController} from "../../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../../UtilRenderer";
import {Icon} from "semantic-ui-react";
import fitty from "fitty";

/**
 * this component is the bubble chart that shows relative friction by tag
 */
export default class TagBubbleChart extends Component {
  /**
   * the constructor function which builds the TagBubbleChart component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + TagBubbleChart.name + "]";
  }

  componentDidMount() {
    if (this.props.tagsTableDto) {
      this.displayTagsChart(this.props.tagsTableDto);
      fitty("#chartTitle", {
        minSize: 14,
        maxSize: 24,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    fitty("#chartTitle", {
      minSize: 14,
      maxSize: 24,
    });

    if (this.props.wtfsTableDto && prevProps.wtfsTableDto !== this.props.wtfsTableDto) {
      console.log("update wtfs data!");
      this.displayWtfsChart(this.props.wtfsTableDto);
    } else if (
      this.isGoingBackToTags(prevProps, this.props) ||
      this.isInitializingTags(prevProps, this.props) ||
      this.isTagsChange(prevProps, this.props)) {
      console.log("update tags data!");
      this.displayTagsChart(this.props.tagsTableDto);
    }

    if (prevProps.selectedRowId !== this.props.selectedRowId ) {
      this.updateCircleSelection(prevProps.selectedRowId, this.props.selectedRowId);
    }

    if (prevProps.hoverRowId !== this.props.hoverRowId ) {
      this.updateCircleHover(prevProps.hoverRowId, this.props.hoverRowId);
    }
  }

  isTagsChange(prevProps, props) {
    return (props.tagsTableDto && prevProps.tagsTableDto !== props.tagsTableDto)
  }

  isInitializingTags(prevProps, props) {
    return !prevProps.tagsTableDto && props.tagsTableDto;
  }

  isGoingBackToTags(prevProps, props) {
    return (prevProps.wtfsTableDto && !props.wtfsTableDto && props.tagsTableDto);
  }

  /**
   * Update the active selection outline on the circles when clicking on a row
   * @param oldId
   * @param newId
   */
  updateCircleSelection(oldId, newId) {
    if (oldId) {
      this.removeClass(oldId, 'active');
    }
    if (newId) {
      this.addClass(newId, 'active');
    }
  }

  /**
   * Update the hover outline on the circles when hovering over a row
   * @param oldId
   * @param newId
   */
  updateCircleHover(oldId, newId) {
    if (oldId) {
      this.removeClass(oldId, 'hover');
    }
    if (newId) {
      this.addClass(newId, 'hover');
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

  displayWtfsChart(tableDto) {
    let treeData = this.createWtfsTreeRoot(tableDto.rowsOfPaddedCells);

    this.blankOutChart();

    if (treeData.children.length > 0) {
      this.createChart(treeData);
    } else {
      console.warn("No data found for chart!");
    }
  }


  displayTagsChart(tableDto) {
    let treeData = this.createTagsTreeRoot(tableDto.rowsOfPaddedCells);

    this.blankOutChart();

    if (treeData.children.length > 0) {
      this.createChart(treeData);
    } else {
      console.warn("No data found for chart!");
    }

  }

  blankOutChart() {
    let chartDiv = document.getElementById("chart");
    if (chartDiv) {
      chartDiv.innerHTML = "";
    }
  }

  /**
   * Display the chart on the screen
   * @param treeData
   */
  createChart(treeData) {
    let titleMargin = 45;
    this.height = DimensionController.getFullRightPanelHeight() - titleMargin;
    this.width = DimensionController.getFullRightPanelHeight() - 10;
    let margin = 5;
    let padding = 2;


    console.log(treeData);

    this.root = d3.hierarchy(treeData, (d) => {return d.children});
    this.root.sum(d => Math.max(0, d.value));

    const pack = d3.pack()
      .size([this.width - margin*2, this.height - margin*2])
      .padding(padding);

    let packed = pack(this.root);
    console.log(packed);


    let svg = d3.select("#chart")
      .append("svg")
      .attr("width", this.width + "px")
      .attr("height", this.height + "px")

    svg.style('transition', 'opacity 0.333s ease-in-out');
    svg.style("opacity", '0');

    this.circleGroup = this.createCircles(svg, packed, margin);

    this.labels = this.createCircleLabels(svg, packed, margin);

    setTimeout(() => {
      svg.style('opacity', '1');
    }, 100);
  }


  /**
   * Create the circles representing the amount of friction experienced
   * @param svg
   * @param packed
   * @param margin
   */
  createCircles(svg, packed, margin) {

    var interp = d3.scaleLinear()
      .domain([0, 0.5, 1])
      .range(["#FFA500", "#FF2C36", "#720000"]);

    let that = this;

    let circleGroup = svg.append("g");

    //invis rectangle that matches the svg dimensions
    circleGroup.append('rect')
      .attr('x', 0)
      .attr('y',0)
      .attr('width', this.width)
      .attr('height',this.height)
      .attr('fill', 'blue')
      .attr('opacity',0)
      .on('mouseleave', function (event, d) {
        that.props.onHoverCircle(null);
      })
    ;

    let parentOpacity = 0;
    if (this.props.drillDownTag) {
      parentOpacity = 0.2;
    }

    circleGroup.selectAll('.node')
      .data(packed)
      .enter()
      .append("circle")
      .attr('class', d => d.children ? 'parent' : 'node')
      .attr('id', d => d.data.name)
      .attr("fill", d => d.children ? interp(1) : interp(0.8))
      .attr("opacity", d => d.children ? parentOpacity : 1)
      .attr("cx", d => d.x+margin)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .on("mouseover", function (event, d) {
        that.props.onHoverCircle(d.data.name);
      })
      .on("click", function (event, d) {
        if (!d.children) {
          that.onClickCircle(svg, d.x, d.y, d.r, d.data.name, d.data.group, d.data.label);
        }
      });

    return circleGroup;

  }

  onClickCircle = (svg, x, y, r, name, group, label) => {
    if (this.props.drillDownTag) {
      this.props.onClickCircle(name, group, label);
    } else {
      //otherwise animate transition
      let el = document.getElementById(name);

      let rRatio = this.root.r / r;

      let newX = Math.round(this.root.x - x);
      let newY = Math.round(this.root.y - y);

      this.circleGroup.append('use')
        .attr('href', '#'+name);

      el.style.transition = 'transform 0.7s ease-in-out';
      el.style.transform = `translate(${newX}px,${newY}px) scale(${rRatio})`;
      el.style.stroke = 'none';
      el.style.transformOrigin = 'center';
      el.style.opacity = '1';
      el.style.transformBox = 'fill-box';

      svg.style('transition', 'opacity 0.7s ease-in-out');
      svg.style('opacity', '0.1');

      setTimeout(() => {
        this.props.onClickCircle(name, group, label);
      }, 700);
    }
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

    let labelGroup = svg.append("g");
    labelGroup.selectAll('.circleClip')
      .data(packed)
      .enter()
      .append("clipPath")
      .attr("id", d => "clip-"+d.data.name)
      .append("circle")
      .attr("r", d => d.r)
      .attr("cx", d => d.x + margin)
      .attr("cy", d => d.y);


    labelGroup.selectAll('.circleLabel')
      .data(packed)
      .enter()
      .append("text")
      .attr("x", d => d.x + margin)
      .attr("y", d => d.y )
      .attr("clip-path", d => "url(#clip-" + d.data.name + ")")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", d => d.r > minRadius ? "top" : "middle")
      .attr("class", "circleLabel")
      .attr("opacity", d => d.children ? 0 : 1)
      .text(d => d.r > superMinRadius ? d.data.label : "");

    labelGroup.selectAll('.circleMetric')
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

    return labelGroup;
  }

  /**
   * Take the input rows of data and create a tree root data structure
   * that can be used for the bubble chart
   * @param data
   */
  createTagsTreeRoot(data) {
    let root = {name: "root", children: []};

    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      let duration = Math.round(UtilRenderer.getSecondsFromDurationString(d[1].trim()));

      if (duration > 0) {
        let child = {name: d[0].trim(), group: d[0].trim(), label: d[0].trim(), value: duration,
          friendlyValue: UtilRenderer.convertSecondsToFriendlyDuration(duration)};

        root.children.push(child);
      } else {
        console.log("filtering zero time row! "+d[0].trim());
      }

    }

    return root;
  }

  /**
   * Take the input rows of data and create a tree root data structure
   * that can be used for the bubble chart
   * @param data
   */
  createWtfsTreeRoot(data) {
    let root = {name: "root", children: []};

    for (let i = 0; i < data.length; i++) {
      let d = data[i];

      let username = d[0].trim();
      let circuit = UtilRenderer.getCircuitName(d[1].trim());
      let duration = UtilRenderer.getSecondsFromDurationString(d[4].trim());

      if (duration > 0) {
        let child = {name: circuit, label: circuit, username: username,
          value: duration ,
          friendlyValue: UtilRenderer.convertSecondsToFriendlyDuration(duration)};

        root.children.push(child);
      } else {
        console.log("filtering zero time row! "+d[0].trim());
      }
    }

    return root;
  }


  /**
   * renders the main flow content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {

    let backButton = "";
    let title = "";

    if (!this.props.tagsTableDto) {
      return <div>Loading...</div>;
    } else if (this.props.drillDownTag === null) {
      title = <div id="chartTitle" className="chartTitle">Top Pain Types</div>;
    } else if (this.props.drillDownTag) {
      backButton = <div className="backButton"><Icon name={"backward"} size={"large"} onClick={this.props.zoomOutToTagsView}/></div>;
      title =  <div id="chartTitle" className="chartTitle">&quot;{UtilRenderer.getCapitalizedName(this.props.drillDownTag)}&quot;</div>
    }

    return (
      <div>
        {backButton}
        <div className="chartTitleWrapperWrapper">
          <div className="chartTitleWrapper">
        {title}
          </div>
        </div>
       <div id="chart" className="frictionCodeChart"/>
      </div>
    );
  }
}
