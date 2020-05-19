/**
 * the dto class that stores the team circuit information of an organization
 * @type {TeamCircuitDto}
 */
module.exports = class TeamCircuitDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.teamId = json.teamId;
      this.organizationId = json.organizationId;
      this.teamName = json.teamName;
      this.defaultRoom = json.defaultRoom;
      this.ownerId = json.ownerId;
      this.ownerName = json.ownerName;
      this.moderatorId = json.moderatorId;
      this.moderatorName = json.moderatorName;
      this.teamMembers = json.teamMembers;
      this.teamRooms = json.teamRooms;
      s;
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
