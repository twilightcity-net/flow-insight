//
// dto class for CircuitTaskSummaryDto
//
module.exports = class CircuitTaskSummaryDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.taskId = json.taskId;
      this.taskName = json.taskName;
      this.description = json.description;
      this.percentLearning = json.percentLearning;
      this.percentConfusion = json.percentConfusion;
      this.percentProgress = json.percentProgress;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'CircuitTaskSummaryDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (this.taskId != null && this.taskName != null)
      return true;
    return false;
  }
};
