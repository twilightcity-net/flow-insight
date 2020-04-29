//
// model class for TaskReferencesInputDto
//
module.exports = class TaskReferencesInputDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.taskName = json.taskName;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TaskReferencesInputDto' : " +
          e.message
      );
    }
  }
};
