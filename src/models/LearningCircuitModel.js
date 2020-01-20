import { BaseModel } from "./BaseModel";

/**
 * this class stores the information associated with a learning circuit on the dreamtalk platform
 * See the CircuitMemberStatusWithMembersDto class to access the participant members of the learning
 * circuit.
 */
export class LearningCircuitModel extends BaseModel {
  /**
   * builds the learning circuit model from json data from gridtime
   * @param json
   * @param scope
   */
  constructor(json, scope) {
    super(scope);
    try {
      if (typeof json === "string") json = JSON.parse(json);
      this.id = json.id;
      this.circuitName = json.circuitName;
      this.wtfTalkRoomId = json.wtfTalkRoomId;
      this.retroTalkRoomId = json.retroTalkRoomId;
      this.ownerId = json.ownerId;
      this.moderatorId = json.moderatorId;
      this.openTime = json.openTime;
      this.closeTime = json.closeTime;
      this.moderatorId = json.moderatorId;
      this.lastOnHoldTime = json.lastOnHoldTime;
      this.lastResumeTime = json.lastResumeTime;
      this.secondsBeforeOnHold = json.secondsBeforeOnHold;
    } catch (e) {
      throw new Error(
        "Unable to create dto 'LearningCircuitModel' : " + e.message
      );
    }
  }
}
