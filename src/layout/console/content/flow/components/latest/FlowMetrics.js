import React, {Component} from "react";
import {DimensionController} from "../../../../../../controllers/DimensionController";
import * as d3 from "d3";
import UtilRenderer from "../../../../../../UtilRenderer";

/**
 * this is the gui component that displays the metrics side panel on the flow dashboard
 */
export default class FlowMetrics extends Component {
  /**
   * builds the IFM chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowMetrics]";
  }


  /**
   * Initially when we get the first set of props, display our metrics
   */
  componentDidMount() {

  }

  /**
   * renders the metrics display
   * @returns {*}
   */
  render() {
    return (
      <div className="metricsPanel">
        <div className="metricsHeader">Metrics Summary</div>
        <div className="summaryMetrics">
          &nbsp;
        </div>
        <div className="detailMetrics">
          &nbsp;
        </div>
      </div>
    );
  }
}
