/**
 * this class is returned by talk when a new member is added to the team
 * @type {TeamMemberAddedEventDto}
 */
module.exports = class TeamMemberAddedEventDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.teamId = json.teamId;
      this.teamName = json.teamName;
      this.teamMemberDto = json.teamMemberDto;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'TeamMemberAddedEventDto' : " +
          e.message
      );
    }
  }
  isValid() {
    if (this.teamId != null)
      return true;
    return false;
  }
};
