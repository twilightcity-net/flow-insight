//
// dto class for NewExecutionActivityDto
//
module.exports = class NewExecutionActivityDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.processName = json.processName;
      this.durationInSeconds = json.durationInSeconds;
      this.endTime = json.endTime;
      this.comment = json.comment;
      this.exitCode = json.exitCode;
      this.executionTaskType = json.executionTaskType;
      this.isDebug = json.isDebug

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NewExecutionActivityDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.durationInSeconds != null)
      return true;
    return false;
  }
};
