import React, { Component } from "react";
import {Divider, Grid, Icon, Image, Popup} from "semantic-ui-react";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the individual journal item entered in by the user
//
export default class TeamMember extends Component {

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  selectRow(rowId, teamMember) {
    let rowObj = document.getElementById(rowId);

    this.props.onSetActiveRow(rowId, rowObj, teamMember);
  }

  /// renders the component of the console view
  render() {

    let activeClass = "";
    if (this.props.activeTeamMember === this.props.teamMember) {
      activeClass = "active";
    }

    return (

      <Grid.Row className={activeClass} id={this.props.id}
                onClick={() => this.props.onSetActiveRow(this.props.id, this.props.teamMember)}>
        <Grid.Column width={1}>
          <Icon link color={this.props.statusColor} name='circle'/>
        </Grid.Column>
        <Grid.Column width={12}>

          <Popup
            trigger={
              <div className="memberText">
                {this.props.shortName}
              </div>
            }
            className="chunkTitle"
            content={
              <div>
                <div>
                  <i>{this.props.name} ({this.props.activeStatus})</i>
                </div>
                <div>
                  <b>{this.props.activeTaskName} </b>
                </div>
                <div>
                  {this.props.activeTaskSummary}
                </div>
                <div>
                  {this.props.workingOn}

                </div>
                <Divider/>
                <div>
                        <span className="date">
                          Torchie Level {this.props.level}&nbsp;&nbsp; (+{this.props.xpRequired} to go)
                        </span>

                </div>
              </div>
            }
            position="bottom left"
            inverted
            hideOnScroll
          />


        </Grid.Column>
      </Grid.Row>
    );
  }
}
