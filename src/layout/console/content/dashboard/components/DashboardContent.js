import React, {Component} from "react";
import FileDrilldownContent from "./FileDrilldownContent";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class DashboardContent extends Component {
  /**
   * the constructor function which builds the DashboardContent component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[" + DashboardContent.name + "]";
  }


  /**
   * renders the main dashboard content body of this console panel
   * @returns {*} - the JSX to be rendered in the window
   */
  render() {
    return (
      // <FrictionBoxContent/>
      <FileDrilldownContent/>
    );
  }
}
