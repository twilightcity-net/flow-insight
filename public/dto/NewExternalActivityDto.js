//
// dto class for NewExternalActivityDto
//
module.exports = class NewExternalActivityDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.durationInSeconds = json.durationInSeconds;
      this.endTime = json.endTime;
      this.comment = json.comment;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NewExternalActivityDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.durationInSeconds != null)
      return true;
    return false;
  }
};
