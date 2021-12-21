//
// dto class for TerminalCircuitDto
//
module.exports = class TerminalCircuitDto {
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);

      this.circuitName = json.circuitName;
      this.talkRoomId = json.talkRoomId;
      this.createdDate = json.createdDate;
      this.creator = json.creator;
      this.circuitMembers = json.circuitMembers;
      this.environmentVariables = json.environmentVariables;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'TerminalCircuitDto' : " +
          e.message
      );
    }
  }

  isValid() {
    if (
      this.circuitName != null &&
      this.circuitName != null
    )
      return true;
    return false;
  }
};
