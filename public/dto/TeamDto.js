//
// dto class for TeamDto
//
module.exports = class TeamDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.organizationId = json.organizationId;
      this.name = json.name;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'MemberWorkStatusDto' : " + e.message
      );
    }
  }
  isValid() {
    if (this.id != null && this.name != null) return true;
    return false;
  }
};
