//
// dto class for MemberWorkStatusDto
//
module.exports = class MemberWorkStatusDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.id = json.id;

      this.email = json.email;
      this.fullName = json.fullName;
      this.shortName = json.shortName;

      this.xpSummary = json.xpSummary;
      this.activeCircle = json.activeCircle;

      this.onlineStatus = json.onlineStatus;
      this.activeTaskId = json.activeTaskId;
      this.activeTaskName = json.activeTaskName;
      this.activeTaskSummary = json.activeTaskSummary;
      this.workingOn = json.workingOn;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'MemberWorkStatusDto' : " + e.message
      );
    }
  }
  isValid() {
    if (this.id != null && this.onlineStatus != null) return true;
    return false;
  }
};
