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
      this.circuitName = json.circuitName;
      this.closeTime = json.closeTime;
      this.id = json.id;
      this.lastOnHoldTime = json.lastOnHoldTime;
      this.lastResumeTime = json.lastResumeTime;
      this.moderatorId = json.moderatorId;
      this.openTime = json.openTime;
      this.ownerId = json.ownerId;
      this.retroTalkRoomId = json.retroTalkRoomId;
      this.secondsBeforeOnHold = json.secondsBeforeOnHold;
      this.wtfTalkRoomId = json.wtfTalkRoomId;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitModel' : " + e.message
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
