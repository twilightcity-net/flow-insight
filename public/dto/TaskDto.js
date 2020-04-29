//
// dto class for TaskDto
//
module.exports = class TaskDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.id = json.id;
      this.name = json.name;
      this.summary = json.summary;
      this.externalId = json.externalId;
      this.projectId = json.projectId;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TaskDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.id != null && this.name != null) return true;
    return false;
  }
};
