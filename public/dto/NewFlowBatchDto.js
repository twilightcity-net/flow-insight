//
// dto class for NewFlowBatchDto
//
module.exports = class NewFlowBatchDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.timeSent = json.timeSent;
      this.editorActivityList = json.editorActivityList;
      this.externalActivityList = json.externalActivityList;
      this.idleActivityList = json.idleActivityList;
      this.executionActivityList = json.executionActivityList;
      this.modificationActivityList = json.modificationActivityList;
      this.eventList = json.eventList;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NewFlowBatchDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.timeSent != null)
      return true;
    return false;
  }
};
