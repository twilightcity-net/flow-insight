//
// model class for IntentionInputDto
//
module.exports = class IntentionInputDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.description = json.description;
      this.projectId = json.projectId;
      this.taskId = json.taskId;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'IntentionInputDto' : " + e.message
      );
    }
  }
};
