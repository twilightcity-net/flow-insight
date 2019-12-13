import React, { Component } from "react";
import FlowChunkHeader from "./FlowChunkHeader";
import FlowContent from "./FlowContent";
import { DataModelFactory } from "../models/DataModelFactory";

//
// this component is the tab panel wrapper for the console content
//
export default class FlowLayout extends Component {
  constructor(props) {
    super(props);

    this.name = "[FlowLayout]";

    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS
    );
  }

  /// performs a simple calculation for dynamic height of items, this
  /// is because there will be a slight variation in the screen height
  calculateJournalItemsHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
      contentArea: 89
    };

    /// subtract the root element's height from total window height that is
    /// half of the clients screen height
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.contentArea
    );
  }

  /// renders the journal layout of the console view
  render() {
    return (
      <div id="component" className="flowLayout">
        <div id="wrapper" className="flowHeader">
          <FlowChunkHeader
            member={this.teamModel.getActiveTeamMemberShortName()}
          />
        </div>
        <div id="wrapper" className="flowContent">
          <FlowContent height={this.calculateJournalItemsHeight()} />
        </div>
      </div>
    );
  }
}
