import React, { Component } from "react";
import { Divider, Grid, Icon, Popup } from "semantic-ui-react";

//
// this component is the individual journal item entered in by the user
//
export default class TeamMember extends Component {

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
    if (
      this.props.activeTeamMember != null &&
      this.props.activeTeamMember.id === this.props.teamMember.id
    ) {
      activeClass = "active";
    }

    let statusCircle = "";

    let online = false;
    if (this.props.statusColor === "offlineColor") {
      statusCircle = (
        <Icon className={this.props.statusColor} name="circle outline" />
      );
    } else {
      online = true;
      statusCircle = (
        <Icon link className={this.props.statusColor} name="circle" />
      );
    }

    let memberNamePanel = "";
    if (this.props.isAlarmTriggered) {
      console.log()
      if (online) {
        memberNamePanel = (
          <span className={this.props.statusColor}>
          {this.props.shortName}{" "}
            <span className="alarm">
            {" "}
              &nbsp;&nbsp; WTF?&nbsp;&nbsp; {this.props.wtfTimer}
          </span>
        </span>
        );
      } else {
        memberNamePanel = (
          <span className={this.props.statusColor}>
          {this.props.shortName}{" "}
            <span className="alarmDim">
            {" "}
              &nbsp;&nbsp; WTF?&nbsp;&nbsp; {this.props.wtfTimer}
          </span>
        </span>
        );
      }

    } else {
      memberNamePanel = (
        <span className={this.props.statusColor}>{this.props.shortName}</span>
      );
    }

    let workingDetails = "";
    if (this.props.workingOn != null && !this.props.isAlarmTriggered) {
      workingDetails = (
        <span>
          <span className="highlight">
            <b>Latest Intention:</b>
          </span>{" "}
          &nbsp;&nbsp;{this.props.workingOn}
        </span>
      );
    } else if (this.props.isAlarmTriggered) {
      workingDetails = (
        <span>
          <span className="alarm">
            <b>WTF Alarm:</b>
          </span>{" "}
          &nbsp;&nbsp;
          <span className="alarmDetails">{this.props.alarmStatusMessage}</span>
        </span>
      );
    }

    let taskTitle = "";
    if (this.props.isAlarmTriggered) {
      taskTitle = <span className="alarm"> {this.props.activeTaskName} </span>;
    } else {
      taskTitle = (
        <span className="taskhighlight"> {this.props.activeTaskName} </span>
      );
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
            trigger={<div className="memberText">{memberNamePanel}</div>}
            className="chunkTitle"
            content={
              <div>
                <div>
                  <i>
                    {this.props.name} ( {this.props.activeStatus} )
                  </i>
                </div>
                <div>
                  <b>{taskTitle}</b>
                </div>
                <div> {this.props.activeTaskSummary}</div>

                <Divider />
                <div>
                  <span className="date">{workingDetails}</span>
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
