/**
 * the dto class that stores the team information of an organization
 * @type {TeamDto}
 */
module.exports = class TeamDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.organizationId = json.organizationId;
      this.name = json.name;

      this.teamType = json.teamType;
      this.me = json.me;
      this.teamMembers = json.teamMembers;
      this.homeTeam = json.homeTeam;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'TeamDto' : " + e.message
      );
    }
  }
  isValid() {
    return this.id != null && this.name != null;
  }
};
