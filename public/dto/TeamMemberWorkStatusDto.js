//
// dto class for TeamMemberWorkStatusDto
//
module.exports = class TeamMemberWorkStatusDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.id = json.id;
      this.teamId = json.teamId;

      this.email = json.email;
      this.fullName = json.fullName;
      this.shortName = json.shortName;
      this.moodRating = json.moodRating;
      this.xpSummary = json.xpSummary;

      this.lastActivity = json.lastActivity;
      this.activeStatus = json.activeStatus;

      this.activeTaskId = json.activeTaskId;
      this.activeTaskName = json.activeTaskName;
      this.activeTaskSummary = json.activeTaskSummary;
      this.workingOn = json.workingOn;

      this.spiritStatus = json.spiritStatus;
      this.spiritMessage = json.spiritMessage;
      this.alarmDurationInSeconds = json.alarmDurationInSeconds;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TeamWithMembersDto' : " + e.message
      );
    }
  }
  isValid() {
    if (this.id != null && this.activeStatus != null) return true;
    return false;
  }
};
