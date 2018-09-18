import React, { Component } from "react";
import TimeScrubber from "./TimeScrubber";
import JournalItems from "./JournalItems";
import JournalEntry from "./JournalEntry";
import {DataStoreFactory} from "../DataStoreFactory";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");


//
// this component is the tab panel wrapper for the console content
//
export default class JournalLayout extends Component {
  constructor(props) {
    super(props);

    this.state = {
      recentProjects: []
    }
  }

  /// performs a simple calculation for dynamic height of items, this
  /// is becuase there will be a slight variation in the screen height
  calculateJournalItemsHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
      timeScrubber: 52,
      journalEntry: 50
    };

    /// subtract the root element's height from total window height that is
    /// half of the clients screen height
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.timeScrubber -
      heights.journalEntry
    );
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentDidMount = () => {
    this.log("Journal Layout : componentDidMount");

    this.store = DataStoreFactory.createStore(
      DataStoreFactory.Stores.RECENT_JOURNAL,
      this
    );

    this.entryStore = DataStoreFactory.createStore(
      DataStoreFactory.Stores.JOURNAL_ENTRY,
      this
    );

    this.store.load(
      null,
      err => {
        setTimeout(() => {
          this.onStoreLoadCb(err);
        }, this.activateWaitDelay);
      });
  };

  onAddEntry = (journalEntry) => {
   this.log("Journal Layout : onAddEntry: "+journalEntry.projectId);

    this.entryStore.load(
      journalEntry,
      err => {
        setTimeout(() => {
          this.onSaveEntryCb(err);
        }, this.activateWaitDelay);
      }
    );
  };

  onSaveEntryCb = (err) => {
    this.log("Journal Layout : onSaveEntryCb saving!");
    if (err) {
      this.entryStore.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {
      let savedEntry = this.entryStore.dto;
      this.log(JSON.stringify(savedEntry, null, 2));


      let recentEntry = {
          projectId : savedEntry.projectId,
          taskId : savedEntry.taskId,
          description: savedEntry.description
        };

      this.setState({recentEntry: recentEntry});

      this.log("Success!!");
    }
  };

  onStoreLoadCb = (err) => {
    this.log("Journal Layout : onStoreLoadCb");
    if (err) {
      this.store.dto = new this.store.dtoClass({
        message: err,
        status: "FAILED"
      });
      this.log("error:" + err);
    } else {

      let recentJournalDto = this.store.dto;

      let recentEntry = {};

      if (recentJournalDto.recentIntentions.length > 0) {
         let latestIntention = recentJournalDto.recentIntentions[0];

         recentEntry = {
           projectId : latestIntention.projectId,
           taskId : latestIntention.taskId,
           description: latestIntention.description
         };
      }

      this.setState({
        recentProjects: recentJournalDto.recentProjects,
        recentTasksByProjectId: recentJournalDto.recentTasksByProjectId,
        recentEntry: recentEntry
      });

      this.log("Success!");
    }
  };

  /// renders the journal layout of the console view
  render() {
    return (
      <div id="component" className="journalLayout">
        <div id="wrapper" className="timeScrubber">
          <TimeScrubber />
        </div>
        <div id="wrapper" className="journalItems">
          <JournalItems height={this.calculateJournalItemsHeight()} />
        </div>
        <div id="wrapper" className="journalEntry">
          <JournalEntry onAddEntry={this.onAddEntry} recentEntry={this.state.recentEntry} recentProjects={this.state.recentProjects} recentTasksByProjectId={this.state.recentTasksByProjectId}/>
        </div>
      </div>
    );
  }
}
