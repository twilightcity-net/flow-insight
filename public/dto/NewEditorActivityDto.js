//
// dto class for NewEditorActivityDto
//
module.exports = class NewEditorActivityDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.durationInSeconds = json.durationInSeconds;
      this.endTime = json.endTime;
      this.module = json.module;
      this.filePath = json.filePath;
      this.isModified = json.modified;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NewEditorActivityDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.durationInSeconds != null)
      return true;
    return false;
  }
};
