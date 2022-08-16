//
// dto class for NewModificationActivityDto
//
module.exports = class NewModificationActivityDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.durationInSeconds = json.durationInSeconds;
      this.endTime = json.endTime;
      this.modificationCount = json.modificationCount;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NewModificationActivityDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.durationInSeconds != null)
      return true;
    return false;
  }
};
