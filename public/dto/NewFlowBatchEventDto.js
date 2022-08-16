//
// dto class for NewFlowBatchEventDto
//
module.exports = class NewFlowBatchEventDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.comment = json.comment;
      this.type = json.type;
      this.position = json.position;

    } catch (e) {
      throw new Error(
        "Unable to create dto 'NewFlowBatchEventDto' : " + e.message
      );
    }
  }

  isValid() {
    if (this.position != null)
      return true;
    return false;
  }
};
