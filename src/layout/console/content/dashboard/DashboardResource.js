import React, { Component } from "react";
import DashboardContent from "./components/DashboardContent";

/**
 * this component is the tab panel wrapper for chart content
 * @copyright Twilight City, Inc. 2021©®™√
 */
export default class DashboardResource extends Component {
  /**
   * builds the chart layout content.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[DashboardResource]";
    this.state = {
      resource: props.resource,
    };
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    return (
      <div id="component" className="flowLayout">
        <div id="wrapper" className="flowContent">
          <DashboardContent />
        </div>
      </div>
    );
  }
}
