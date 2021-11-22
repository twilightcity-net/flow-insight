//
// dto class for TaskDto
//
module.exports = class TeamWithMembersDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.organizationId = json.organizationId;
      this.teamId = json.teamId;
      this.teamName = json.teamName;
      this.me = json.me;
      this.teamMembers = json.teamMembers;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TeamWithMembersDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (this.teamId != null && this.me != null) return true;
    return false;
  }
};
