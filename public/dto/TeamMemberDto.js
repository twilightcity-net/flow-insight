/**
 * this class backs the team panel data model array thingy
 * @type {TeamMemberDto}
 */
module.exports = class TeamMemberDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.email = json.email;
      this.fullName = json.fullName;
      this.displayName = json.displayName;
      this.username = json.username;
      this.xpSummary = json.xpSummary;
      this.activeJoinType = json.activeJoinType;
      this.activeCircuit = json.activeCircuit;
      this.onlineStatus = json.onlineStatus;
      this.activeTaskId = json.activeTaskId;
      this.activeTaskName = json.activeTaskName;
      this.activeTaskSummary = json.activeTaskSummary;
      this.workingOn = json.workingOn;

      this.fervieColor = json.fervieColor;
      this.fervieSecondaryColor = json.fervieSecondaryColor;
      this.fervieTertiaryColor = json.fervieTertiaryColor;
      this.fervieAccessory = json.fervieAccessory;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TeamMemberDto' : " +
          e.message
      );
    }
  }
  isValid() {
    if (this.id != null && this.onlineStatus != null)
      return true;
    return false;
  }
};
