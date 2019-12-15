import React, { Component } from "react";
import FlowHeader from "./FlowHeader";
import FlowContent from "./FlowContent";
import { DataModelFactory } from "../../models/DataModelFactory";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 * @copyright DreamScale, Inc. 2020©®™√
 */
export default class FlowLayout extends Component {
  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);

    this.name = "[FlowLayout]";

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS
    );
  }

  /**
   * performs a simple calculation for dynamic height of items, this is because there will be a slight variation in the
   * screen height
   * @returns {number} - the number to set the style height attribute at
   */
  calculateFlowHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
      contentArea: 89
    };

    /*
     subtract the root element's height from total window height that is half of the clients screen height
     */
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.contentArea
    );
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the rendered components JSX
   */
  render() {
    return (
      <div id="component" className="flowLayout">
        <div id="wrapper" className="flowHeader">
          <FlowHeader member={this.teamModel.getActiveTeamMemberShortName()} />
        </div>
        <div id="wrapper" className="flowContent">
          <FlowContent height={this.calculateFlowHeight()} />
        </div>
      </div>
    );
  }
}
