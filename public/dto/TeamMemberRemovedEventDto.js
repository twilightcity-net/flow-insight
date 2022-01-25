/**
 * this class is returned by talk when a member is removed from the team
 * @type {TeamMemberRemovedEventDto}
 */
module.exports = class TeamMemberRemovedEventDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.teamId = json.teamId;
      this.teamName = json.teamName;

      this.memberId = json.memberId;
      this.username = json.username;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TeamMemberRemovedEventDto' : " +
          e.message
      );
    }
  }
  isValid() {
    if (this.teamId != null) return true;
    return false;
  }
};
