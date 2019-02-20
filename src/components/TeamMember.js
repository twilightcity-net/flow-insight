import React, { Component } from "react";
import { Divider, Grid, Icon, Popup } from "semantic-ui-react";

const { remote } = window.require("electron");

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

  formatAsDuration(alarmDurationInSeconds) {
    let minutes = Math.floor(alarmDurationInSeconds / 60);

    return minutes + " minutes";
  }

  /// renders the component of the console view
  render() {
    let activeClass = "";
    if (this.props.activeTeamMember === this.props.teamMember) {
      activeClass = "active";
    }

    let statusCircle = "";

    if (this.props.statusColor === "offlineColor") {
      statusCircle = (
        <Icon className={this.props.statusColor} name="circle outline" />
      );
    } else {
      statusCircle = (
        <Icon link className={this.props.statusColor} name="circle" />
      );
    }

    let activeStatus = this.props.activeStatus;
    let alarmDetails = "";

    if (this.props.spiritStatus === "WTF?!") {
      activeStatus =
        this.props.spiritStatus +
        " " +
        this.formatAsDuration(this.props.alarmDurationInSeconds);
      alarmDetails = this.props.spiritStatus + " " + this.props.spiritMessage;
    }

    return (
      <Grid.Row
        className={activeClass}
        id={this.props.id}
        onClick={() =>
          this.props.onSetActiveRow(this.props.id, this.props.teamMember)
        }
      >
        <Grid.Column width={1}>{statusCircle}</Grid.Column>
        <Grid.Column width={12}>
          <Popup
            trigger={
              <div className="memberText">
                <span className={this.props.statusColor}>
                  {this.props.shortName}
                </span>
              </div>
            }
            className="chunkTitle"
            content={
              <div>
                <div>
                  <i>
                    {this.props.name} ( {activeStatus} )
                  </i>
                </div>
                <div>
                  <b>{this.props.activeTaskName} </b>
                </div>
                <div>{this.props.activeTaskSummary}</div>
                <div>{this.props.workingOn}</div>
                <div>
                  <span className="alarm">{alarmDetails}</span>
                </div>

                <Divider />
                <div>
                  <span className="date">
                    Torchie Level {this.props.level}&nbsp;&nbsp; (+
                    {this.props.xpRequired} to go)
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
