import { DataModel } from "./DataModel";
import { WTFTimer } from "./WTFTimer";

const { remote } = window.require("electron"),
  MemberWorkStatusDto = remote.require("./dto/MemberWorkStatusDto");

//
// this class is used to manage DataClient requests for Stores
//
export class TeamModel extends DataModel {
  constructor(scope) {
    super(scope);

    this.name = "[TeamModel]";

    this.isInitialized = false;

    this.me = {};
    this.teamMembers = [];
    this.activeTeamMember = null;
  }

  static get CallbackEvent() {
    return {
      ME_UPDATE: "me-update",
      MEMBERS_UPDATE: "members-update",
      ACTIVE_MEMBER_UPDATE: "active-member-update"
    };
  }

  isMeActive = () => {
    let meActive = true;
    if (this.activeTeamMember != null && this.me != null) {
      if (this.activeTeamMember.id !== this.me.id) {
        meActive = false;
      }
    }
    return meActive;
  };

  /**
   * Refresh all team members status, and callback when done
   * @param callWhenDone
   */

  refreshAll = () => {
    console.log(this.name + " - Request - refreshAll");
    let remoteUrn = "/status/team";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      MemberWorkStatusDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onRefreshAllCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  };

  /**
   * Retrieve a specific members summary
   * @param memberId
   */
  getMemberStatus = memberId => {
    let memberStatus = null;

    if (memberId === this.me.id) {
      memberStatus = this.me;
    } else {
      for (var i in this.teamMembers) {
        let member = this.teamMembers[i];
        if (member.id === memberId) {
          memberStatus = member;
          break;
        }
      }
    }

    return memberStatus;
  };

  /**
   * Refresh status of self, and callback when done
   * @param callWhenDone
   */

  refreshMe() {
    console.log(this.name + " - Request - refreshMe");
    let remoteUrn = "/status/me";
    let loadRequestType = DataModel.RequestTypes.GET;
    this.remoteFetch(
      null,
      remoteUrn,
      loadRequestType,
      MemberWorkStatusDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onRefreshMeCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      }
    );
  }

  resetActiveMemberToMe() {
    this.setActiveMember(this.me.id);
  }

  setActiveMember = memberId => {
    if (memberId === this.me.id) {
      this.activeTeamMember = this.me;
    } else {
      for (var i in this.teamMembers) {
        if (this.teamMembers[i].id === memberId) {
          this.activeTeamMember = this.teamMembers[i];
        }
      }
    }

    this.notifyListeners(TeamModel.CallbackEvent.ACTIVE_MEMBER_UPDATE);
  };

  onRefreshMeCb = (statusOfMe, err) => {
    if (err) {
      console.log(this.name + " - onRefreshMeCb error:" + err);
    } else {
      this.me = this.createMember(0, statusOfMe);
    }
    this.notifyListeners(TeamModel.CallbackEvent.MEMBERS_UPDATE);
  };

  onRefreshAllCb = (memberStatusDtos, err) => {
    if (err) {
      console.log(this.name + " - onRefreshAllCb error:" + err);
    } else {
      //transform into presentation objects
      this.teamMembers = [];

      for (var i in memberStatusDtos) {
        //TODO figure out why we've got nulls in the list?
        let memberDto = memberStatusDtos[i];

        if (memberDto != null) {
          if (Number(i) === 0) {
            this.me = this.createMember(0, memberDto);
          } else {
            this.teamMembers[i - 1] = this.createMember(i, memberDto);
          }
        }
      }

      this.refreshActiveMember();
    }
    this.isInitialized = true;
    this.notifyListeners(TeamModel.CallbackEvent.MEMBERS_UPDATE);
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
    let wtfTimer = null;
    let alarmStatusMessage = null;
    let alarmCircleName = null;
    let activeCircleId;
    if (teamMember.activeCircle) {
      isAlarmTriggered = true;
      wtfTimer = WTFTimer.formatWTFTimerInMinutes(
        teamMember.activeCircle.durationInSeconds
      );
      alarmStatusMessage = teamMember.activeCircle.problemDescription;
      alarmCircleName = teamMember.activeCircle.circleName;
      activeCircleId = teamMember.activeCircle.id;
    }

    return {
      id: teamMember.id,
      email: teamMember.email,
      name: teamMember.fullName,
      shortName: teamMember.shortName,

      activeStatus: this.toActiveStatus(
        teamMember.onlineStatus,
        isAlarmTriggered
      ),
      activeTaskName: teamMember.activeTaskName,
      activeTaskSummary: teamMember.activeTaskSummary,
      level: level,
      xpRequired: xpRequired,
      xpSummary: teamMember.xpSummary,
      workingOn: teamMember.workingOn,
      isAlarmTriggered: isAlarmTriggered,
      wtfTimer: wtfTimer,
      alarmStatusMessage: alarmStatusMessage,
      alarmCircleName: alarmCircleName,
      activeCircleId: activeCircleId,
      activeCircle: teamMember.activeCircle,
      statusColor: this.toStatusColor(teamMember.onlineStatus, isAlarmTriggered)
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
    if (isAlarmTriggered === true && onlineStatus === "Online") {
      statusColor = "red";
    }

    return statusColor;
  };
}
