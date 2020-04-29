/**
 * this class stores the information associated with a learning circuit on the dreamtalk platform
 * See the CircuitMemberStatusWithMembersDto class to access the participant members of the learning
 * circuit.
 */
export class LearningCircuitModel {
  /**
   * builds the learning circuit model from json data from gridtime
   * @param json
   */
  constructor(json) {
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.circuitName = json.circuitName;
      this.description = json.description;
      this.tags = json.tags;
      this.wtfTalkRoomName = json.wtfTalkRoomName;
      this.wtfTalkRoomId = json.wtfTalkRoomId;
      this.retroTalkRoomName = json.retroTalkRoomName;
      this.retroTalkRoomId = json.retroTalkRoomId;
      this.ownerId = json.ownerId;
      this.ownerName = json.ownerName;
      this.moderatorName = json.moderatorName;
      this.moderatorId = json.moderatorId;
      this.openTime = json.openTime;
      this.openTimeStr = json.openTimeStr;
      this.closeTime = json.closeTime;
      this.closeTimeStr = json.closeTimeStr;
      this.circuitStatus = json.circuitStatus;
      this.lastOnHoldTime = json.lastOnHoldTime;
      this.lastOnHoldTimeStr = json.lastOnHoldTimeStr;
      this.lastResumeTime = json.lastResumeTime;
      this.lastResumeTimeStr = json.lastResumeTimeStr;
      this.secondsBeforeOnHold = json.secondsBeforeOnHold;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitModel' : " +
          e.message
      );
    }
  }

  /**
   * checks if we are in retro mode by looking to see if we have a retro room
   * @param model
   * @returns {boolean}
   */
  static isRetro(model) {
    return !!model.retroTalkRoomId;
  }
}
