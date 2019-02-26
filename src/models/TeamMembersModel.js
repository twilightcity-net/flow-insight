import {DataModel} from "./DataModel";

const { remote } = window.require("electron"),
  MemberWorkStatusDto = remote.require("./dto/MemberWorkStatusDto");

//
// this class is used to manage DataClient requests for Stores
//
export class TeamMembersModel extends DataModel {
  constructor(scope) {
    super(scope);
    this.me = {};
    this.teamMembers = [];
    this.activeTeamMember = null;
    this.callbackOnUpdate = () => {}

  }

  registerCallbackOnUpdate = (callback) => {
     this.callbackOnUpdate = callback;
  };

  /**
   * Refresh all team members status, and callback when done
   * @param callWhenDone
   */

  refreshAll = () => {
    let remoteUrn = "/status/team";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(null, remoteUrn, loadRequestType, MemberWorkStatusDto, (dtoResults, err) => {
      setTimeout(() => {
        this.onRefreshAllCb(dtoResults, err);
      }, DataModel.activeWaitDelay);
    });
  };

  /**
   * Refresh status of self, and callback when done
   * @param callWhenDone
   */

  refreshMe() {
    let remoteUrn = "/status/me";
    let loadRequestType = DataModel.RequestTypes.GET;
    this.remoteFetch(null, remoteUrn, loadRequestType, MemberWorkStatusDto, (dtoResults, err) => {
      setTimeout(() => {
        this.onRefreshMeCb(dtoResults, err);
      }, DataModel.activeWaitDelay);
    });
  }

  setActiveMember = (memberId) => {
    if (memberId == this.me.id) {
      this.activeTeamMember = this.me;
    } else {
      for (var i in this.teamMembers) {
        if (this.teamMembers[i].id === memberId) {
          this.activeTeamMember = this.teamMembers[i];
        }
      }
    }
  };

  onRefreshMeCb = (statusOfMe, err) => {
    console.log("TeamMembersModel : onRefreshMeCb");
    if (err) {
      console.log("error:" + err);
    } else {

      this.me = this.createMember(0, statusOfMe);

      if (this.teamMembers.length > 0) {
        this.teamMembers[0] = this.me;
      }
    }
    this.callbackOnUpdate.call(this.scope);
  };


  onRefreshAllCb = (memberStatusDtos, err) => {
    console.log("TeamMembersModel : onRefreshAllCb" + memberStatusDtos);
    if (err) {
      console.log("error:" + err);
    } else {

      //transform into presentation objects
      this.teamMembers = [];

      for (var i in memberStatusDtos) {
        if (i == 0) {
          this.me = this.createMember(0, memberStatusDtos[0]);
        } else {
          this.teamMembers[i-1] = this.createMember(i, memberStatusDtos[i]);
        }
      }

      this.refreshActiveMember();

    }
    console.log("Return callback!");

    this.callbackOnUpdate.call(this.scope);
  };

  refreshActiveMember = () => {
    if (this.activeTeamMember == null) {
       this.activeTeamMember = this.me;
    } else {
       this.setActiveMember(this.activeTeamMember.id);
    }
  };

  createMember = (index, teamMember) => {

    let level = 0;
    let xpRequired = 0;
    if (teamMember.xpSummary) {
      level = teamMember.xpSummary.level;
      xpRequired =
        teamMember.xpSummary.xpRequiredToLevel -
        teamMember.xpSummary.xpProgress;
    }

    let isAlarmTriggered = false;
    let alarmDurationInSeconds = 0;
    let alarmStatusMessage = null;
    let alarmCircleName = null;
    let activeCircleId;
    if (teamMember.activeCircle) {
      isAlarmTriggered = true;
      alarmDurationInSeconds = teamMember.activeCircle.durationInSeconds;
      alarmStatusMessage = teamMember.activeCircle.problemDescription;
      alarmCircleName = teamMember.activeCircle.circleName;
      activeCircleId = teamMember.activeCircle.id;
    }


    return {
      id: teamMember.id,
      email: teamMember.email,
      name: teamMember.fullName,
      shortName: teamMember.shortName,

      activeStatus: this.toActiveStatus(teamMember.onlineStatus, isAlarmTriggered),
      activeTaskName: teamMember.activeTaskName,
      activeTaskSummary: teamMember.activeTaskSummary,
      level: level,
      xpRequired: xpRequired,
      workingOn: teamMember.workingOn,

      isAlarmTriggered: isAlarmTriggered,
      alarmDurationInSeconds: alarmDurationInSeconds,
      alarmStatusMessage: alarmStatusMessage,
      alarmCircleName: alarmCircleName,
      activeCircleId: activeCircleId,

      statusColor: this.toStatusColor(
        teamMember.onlineStatus,
        isAlarmTriggered
      )
    };
  };

  toActiveStatus = (onlineStatus, isAlarmTriggered) => {

    let activeStatus = onlineStatus;
    if (isAlarmTriggered === true) {
      activeStatus = "Troubleshooting";
    }
    return activeStatus;
  };

  toStatusColor = (onlineStatus, isAlarmTriggered) => {

    let statusColor = "offlineColor";
    if (onlineStatus === "Online") {
      statusColor = "onlineColor";
    }
    if (isAlarmTriggered === true) {
      statusColor = "red";
    }

    return statusColor;
  };


}
